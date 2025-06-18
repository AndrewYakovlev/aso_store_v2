import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductDto,
  ProductsFilterDto,
  PaginatedProductsDto,
} from './dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto): Promise<ProductDto> {
    const { categoryIds, images, brandId, ...productData } = createProductDto;

    // Check if SKU already exists
    const existingBySku = await this.prisma.product.findUnique({
      where: { sku: productData.sku },
    });
    if (existingBySku) {
      throw new ConflictException('Product with this SKU already exists');
    }

    // Check if slug already exists
    const existingBySlug = await this.prisma.product.findUnique({
      where: { slug: productData.slug },
    });
    if (existingBySlug) {
      throw new ConflictException('Product with this slug already exists');
    }

    // Create product with categories
    const product = await this.prisma.product.create({
      data: {
        ...productData,
        images: images || [],
        ...(brandId && { brand: { connect: { id: brandId } } }),
        categories: {
          create: categoryIds.map(categoryId => ({
            category: { connect: { id: categoryId } },
          })),
        },
      },
      include: {
        brand: true,
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    return this.mapToDto(product);
  }

  async findAll(filter: ProductsFilterDto): Promise<PaginatedProductsDto> {
    const {
      search,
      categoryIds,
      brandIds,
      minPrice,
      maxPrice,
      onlyActive,
      inStock,
      vehicleModelId,
      vehicleYear,
      attributes,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filter;

    const where: Prisma.ProductWhereInput = {};

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Category filter
    if (categoryIds && categoryIds.length > 0) {
      where.categories = {
        some: {
          categoryId: { in: categoryIds },
        },
      };
    }

    // Brand filter
    if (brandIds && brandIds.length > 0) {
      where.brandId = { in: brandIds };
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    // Active filter
    if (onlyActive) {
      where.isActive = true;
    }

    // In stock filter
    if (inStock) {
      where.stock = { gt: 0 };
    }

    // Vehicle filter
    if (vehicleModelId) {
      const vehicleFilter: any = { vehicleModelId };
      
      // If year is specified, filter by year range
      if (vehicleYear) {
        vehicleFilter.AND = [
          {
            OR: [
              { yearFrom: null },
              { yearFrom: { lte: vehicleYear } },
            ],
          },
          {
            OR: [
              { yearTo: null },
              { yearTo: { gte: vehicleYear } },
            ],
          },
        ];
      }
      
      where.vehicles = {
        some: vehicleFilter,
      };
    }

    // Attributes filter
    if (attributes && Object.keys(attributes).length > 0) {
      const attributeFilters: any[] = [];
      
      for (const [attributeId, filterData] of Object.entries(attributes)) {
        const attribute = await this.prisma.attribute.findUnique({
          where: { id: attributeId },
        });

        if (!attribute) continue;

        let attributeCondition: any = {};

        switch (attribute.type) {
          case 'SELECT_ONE':
          case 'SELECT_MANY':
            // Для SELECT типов фильтруем по ID опций
            // Обрабатываем как массив, так и одиночное значение
            let optionValues: string[] = [];
            if (Array.isArray(filterData.values)) {
              optionValues = filterData.values as string[];
            } else if (typeof filterData.values === 'string' && filterData.values) {
              optionValues = [filterData.values];
            }
            
            if (optionValues.length > 0) {
              attributeCondition = {
                attributeId,
                optionIds: {
                  hasSome: optionValues,
                },
              };
            }
            break;
          
          case 'NUMBER':
            // Для NUMBER типа фильтруем по диапазону
            if (Array.isArray(filterData.values) && filterData.values.length === 2) {
              const [min, max] = filterData.values as number[];
              attributeCondition = {
                attributeId,
                numberValue: {
                  gte: min,
                  lte: max,
                },
              };
            }
            break;
          
          case 'TEXT':
            // Для TEXT типа фильтруем по подстроке
            if (typeof filterData.values === 'string' && filterData.values) {
              attributeCondition = {
                attributeId,
                textValue: {
                  contains: filterData.values,
                  mode: 'insensitive',
                },
              };
            }
            break;
          
          case 'COLOR':
            // Для COLOR типа точное совпадение
            if (typeof filterData.values === 'string' && filterData.values) {
              attributeCondition = {
                attributeId,
                colorValue: filterData.values,
              };
            }
            break;
        }

        if (Object.keys(attributeCondition).length > 0) {
          attributeFilters.push(attributeCondition);
        }
      }

      if (attributeFilters.length > 0) {
        where.attributes = {
          some: {
            AND: attributeFilters,
          },
        };
      }
    }

    // Count total
    const total = await this.prisma.product.count({ where });

    // Get products
    const products = await this.prisma.product.findMany({
      where,
      include: {
        brand: true,
        categories: {
          include: {
            category: true,
          },
        },
        specifications: true,
        attributes: {
          include: {
            attribute: {
              include: {
                options: true,
              },
            },
          },
        },
        vehicles: {
          include: {
            vehicleModel: {
              include: {
                brand: true,
              },
            },
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: products.map(product => this.mapToDto(product)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findBySlug(slug: string): Promise<ProductDto> {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        brand: true,
        categories: {
          include: {
            category: true,
          },
        },
        specifications: true,
        attributes: {
          include: {
            attribute: {
              include: {
                options: true,
              },
            },
          },
        },
        vehicles: {
          include: {
            vehicleModel: {
              include: {
                brand: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.mapToDto(product);
  }

  async findById(id: string): Promise<ProductDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        brand: true,
        categories: {
          include: {
            category: true,
          },
        },
        specifications: true,
        attributes: {
          include: {
            attribute: {
              include: {
                options: true,
              },
            },
          },
        },
        vehicles: {
          include: {
            vehicleModel: {
              include: {
                brand: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.mapToDto(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<ProductDto> {
    const { categoryIds, images, brandId, ...productData } = updateProductDto;

    // Check if product exists
    const existing = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    // Check if slug is being updated and already exists
    if (productData.slug && productData.slug !== existing.slug) {
      const existingBySlug = await this.prisma.product.findUnique({
        where: { slug: productData.slug },
      });
      if (existingBySlug) {
        throw new ConflictException('Product with this slug already exists');
      }
    }

    // Update product
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...productData,
        ...(images !== undefined && { images }),
        ...(brandId !== undefined && { 
          brand: brandId ? { connect: { id: brandId } } : { disconnect: true } 
        }),
        ...(categoryIds !== undefined && {
          categories: {
            deleteMany: {},
            create: categoryIds.map(categoryId => ({
              category: { connect: { id: categoryId } },
            })),
          },
        }),
      },
      include: {
        brand: true,
        categories: {
          include: {
            category: true,
          },
        },
        specifications: true,
        attributes: {
          include: {
            attribute: {
              include: {
                options: true,
              },
            },
          },
        },
        vehicles: {
          include: {
            vehicleModel: {
              include: {
                brand: true,
              },
            },
          },
        },
      },
    });

    return this.mapToDto(product);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    await this.prisma.product.delete({
      where: { id },
    });
  }

  async findByCategorySlug(categorySlug: string, filter: ProductsFilterDto): Promise<PaginatedProductsDto> {
    const category = await this.prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Add category filter
    filter.categoryIds = [category.id];
    
    return this.findAll(filter);
  }

  private mapToDto(product: any): ProductDto {
    const dto: ProductDto = {
      id: product.id,
      sku: product.sku,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price.toNumber(),
      stock: product.stock,
      isActive: product.isActive,
      images: product.images as string[],
      brandId: product.brandId,
      categories: product.categories?.map((pc: any) => ({
        id: pc.category.id,
        name: pc.category.name,
        slug: pc.category.slug,
        description: pc.category.description,
        parentId: pc.category.parentId,
        isActive: pc.category.isActive,
        sortOrder: pc.category.sortOrder,
      })) || [],
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };

    // Добавляем опциональные поля
    if (product.brand) {
      dto.brand = {
        id: product.brand.id,
        name: product.brand.name,
        slug: product.brand.slug,
        description: product.brand.description,
        logo: product.brand.logo,
        website: product.brand.website,
        country: product.brand.country,
        isActive: product.brand.isActive,
        sortOrder: product.brand.sortOrder,
        createdAt: product.brand.createdAt,
        updatedAt: product.brand.updatedAt,
      };
    }

    if (product.specifications) {
      dto.specifications = product.specifications;
    }

    // Добавляем атрибуты
    if (product.attributes) {
      dto.attributes = product.attributes.map((pa: any) => {
        const attrValue: any = {
          attributeId: pa.attributeId,
          attribute: {
            id: pa.attribute.id,
            code: pa.attribute.code,
            name: pa.attribute.name,
            type: pa.attribute.type,
            unit: pa.attribute.unit,
            isRequired: pa.attribute.isRequired,
            isFilterable: pa.attribute.isFilterable,
            sortOrder: pa.attribute.sortOrder,
            options: pa.attribute.options,
            createdAt: pa.attribute.createdAt,
            updatedAt: pa.attribute.updatedAt,
          },
        };

        // Добавляем значения в зависимости от типа
        if (pa.textValue !== null) attrValue.textValue = pa.textValue;
        if (pa.numberValue !== null) attrValue.numberValue = pa.numberValue;
        if (pa.colorValue !== null) attrValue.colorValue = pa.colorValue;
        if (pa.optionIds && pa.optionIds.length > 0) attrValue.optionIds = pa.optionIds;

        return attrValue;
      });
    }

    // Добавляем информацию об автомобилях
    if (product.vehicles) {
      dto.vehicles = product.vehicles.map((pv: any) => ({
        id: pv.id,
        productId: pv.productId,
        vehicleModelId: pv.vehicleModelId,
        yearFrom: pv.yearFrom,
        yearTo: pv.yearTo,
        fitmentNotes: pv.fitmentNotes,
        isUniversal: pv.isUniversal,
        createdAt: pv.createdAt,
        updatedAt: pv.updatedAt,
        vehicleModel: pv.vehicleModel ? {
          id: pv.vehicleModel.id,
          externalId: pv.vehicleModel.externalId,
          brandId: pv.vehicleModel.brandId,
          name: pv.vehicleModel.name,
          nameCyrillic: pv.vehicleModel.nameCyrillic,
          slug: pv.vehicleModel.slug,
          class: pv.vehicleModel.class,
          yearFrom: pv.vehicleModel.yearFrom,
          yearTo: pv.vehicleModel.yearTo,
          image: pv.vehicleModel.image,
          isActive: pv.vehicleModel.isActive,
          sortOrder: pv.vehicleModel.sortOrder,
          createdAt: pv.vehicleModel.createdAt,
          updatedAt: pv.vehicleModel.updatedAt,
          brand: pv.vehicleModel.brand ? {
            id: pv.vehicleModel.brand.id,
            externalId: pv.vehicleModel.brand.externalId,
            name: pv.vehicleModel.brand.name,
            nameCyrillic: pv.vehicleModel.brand.nameCyrillic,
            slug: pv.vehicleModel.brand.slug,
            country: pv.vehicleModel.brand.country,
            logo: pv.vehicleModel.brand.logo,
            popular: pv.vehicleModel.brand.popular,
            isActive: pv.vehicleModel.brand.isActive,
            sortOrder: pv.vehicleModel.brand.sortOrder,
            createdAt: pv.vehicleModel.brand.createdAt,
            updatedAt: pv.vehicleModel.brand.updatedAt,
          } : undefined,
        } : undefined,
      }));
    }

    return dto;
  }

  async getAvailableFilters(baseFilter: ProductsFilterDto) {
    try {
      console.log('Getting available filters with base filter:', JSON.stringify(baseFilter, null, 2));
      
      // Создаем копию фильтра без брендов для получения всех доступных брендов
      const { brandIds, ...baseFilterWithoutBrands } = baseFilter;
      
      // Создаем копию фильтра без категорий для получения всех доступных категорий
      const { categoryIds, ...baseFilterWithoutCategories } = baseFilter;
      
      // Получаем фильтры для категорий и брендов без учета их собственных фильтров
      const categoriesAndBrandsFilters = await this.getFiltersForCategoriesAndBrands({
        ...baseFilterWithoutBrands,
        ...baseFilterWithoutCategories,
        // Но обязательно сохраняем текущие категории для правильной фильтрации брендов
        categoryIds: baseFilter.categoryIds,
      });
      
      // Для диапазона цен используем фильтр без ограничений по цене, но с категориями
      const { minPrice, maxPrice, ...baseFilterWithoutPrice } = baseFilter;
      const priceRangeFilter = await this.getPriceRange(baseFilterWithoutPrice);
      
      // Для атрибутов создаем отдельные фильтры без учета каждого конкретного атрибута
      const attributeFilters = await this.getAttributeFiltersWithoutSelf(baseFilter);
      
      return {
        attributes: attributeFilters,
        priceRange: priceRangeFilter,
        categories: categoriesAndBrandsFilters.categories,
        brands: categoriesAndBrandsFilters.brands,
      };
    } catch (error) {
      console.error('Error in getAvailableFilters:', error);
      throw error;
    }
  }

  private async getPriceRange(baseFilter: ProductsFilterDto) {
    console.log('getPriceRange called with:', JSON.stringify(baseFilter, null, 2));
    const where: Prisma.ProductWhereInput = {};
    
    if (baseFilter.search) {
      where.OR = [
        { name: { contains: baseFilter.search, mode: 'insensitive' } },
        { sku: { contains: baseFilter.search, mode: 'insensitive' } },
        { description: { contains: baseFilter.search, mode: 'insensitive' } },
      ];
    }

    // ВАЖНО: Применяем фильтр по категориям для получения правильного диапазона цен
    if (baseFilter.categoryIds && baseFilter.categoryIds.length > 0) {
      where.categories = {
        some: {
          categoryId: { in: baseFilter.categoryIds },
        },
      };
    }

    // Применяем фильтр по брендам
    if (baseFilter.brandIds && baseFilter.brandIds.length > 0) {
      where.brandId = { in: baseFilter.brandIds };
    }

    if (baseFilter.vehicleModelId) {
      where.vehicles = {
        some: { vehicleModelId: baseFilter.vehicleModelId },
      };
    }

    if (baseFilter.onlyActive) {
      where.isActive = true;
    }

    if (baseFilter.inStock) {
      where.stock = { gt: 0 };
    }

    // Обработка фильтров по атрибутам
    if (baseFilter.attributes && Object.keys(baseFilter.attributes).length > 0) {
      const attributeFilters: any[] = [];
      
      for (const [attributeId, filterData] of Object.entries(baseFilter.attributes)) {
        const attribute = await this.prisma.attribute.findUnique({
          where: { id: attributeId },
        });

        if (!attribute) continue;

        const attributeCondition: any = {
          attributeId,
        };

        switch (attribute.type) {
          case 'SELECT_ONE':
          case 'SELECT_MANY':
            // Обрабатываем как массив, так и одиночное значение
            let optionValues: string[] = [];
            if (Array.isArray(filterData.values)) {
              optionValues = filterData.values as string[];
            } else if (typeof filterData.values === 'string' && filterData.values) {
              optionValues = [filterData.values];
            }
            
            if (optionValues.length > 0) {
              attributeCondition.optionIds = {
                hasSome: optionValues,
              };
            }
            break;
          
          case 'NUMBER':
            if (Array.isArray(filterData.values) && filterData.values.length === 2) {
              const [min, max] = filterData.values as number[];
              attributeCondition.numberValue = {
                gte: min,
                lte: max,
              };
            }
            break;
          
          case 'TEXT':
            if (typeof filterData.values === 'string' && filterData.values) {
              attributeCondition.textValue = {
                contains: filterData.values,
                mode: 'insensitive',
              };
            }
            break;
          
          case 'COLOR':
            if (typeof filterData.values === 'string' && filterData.values) {
              attributeCondition.colorValue = filterData.values;
            }
            break;
        }

        if (Object.keys(attributeCondition).length > 1) {
          attributeFilters.push(attributeCondition);
        }
      }

      if (attributeFilters.length > 0) {
        where.attributes = {
          some: {
            AND: attributeFilters,
          },
        };
      }
    }

    // Получаем минимальную и максимальную цену
    const result = await this.prisma.product.aggregate({
      where,
      _min: {
        price: true,
      },
      _max: {
        price: true,
      },
    });

    return {
      min: result._min.price?.toNumber() || 0,
      max: result._max.price?.toNumber() || 0,
    };
  }

  private async getFiltersForCategoriesAndBrands(baseFilter: ProductsFilterDto) {
    console.log('getFiltersForCategoriesAndBrands called with:', JSON.stringify(baseFilter, null, 2));
    const where: Prisma.ProductWhereInput = {};
    
    if (baseFilter.search) {
      where.OR = [
        { name: { contains: baseFilter.search, mode: 'insensitive' } },
        { sku: { contains: baseFilter.search, mode: 'insensitive' } },
        { description: { contains: baseFilter.search, mode: 'insensitive' } },
      ];
    }

    // ВАЖНО: Применяем фильтр по категориям для получения правильных брендов
    if (baseFilter.categoryIds && baseFilter.categoryIds.length > 0) {
      where.categories = {
        some: {
          categoryId: { in: baseFilter.categoryIds },
        },
      };
    }

    if (baseFilter.minPrice !== undefined || baseFilter.maxPrice !== undefined) {
      where.price = {};
      if (baseFilter.minPrice !== undefined) {
        where.price.gte = baseFilter.minPrice;
      }
      if (baseFilter.maxPrice !== undefined) {
        where.price.lte = baseFilter.maxPrice;
      }
    }

    if (baseFilter.vehicleModelId) {
      where.vehicles = {
        some: { vehicleModelId: baseFilter.vehicleModelId },
      };
    }

    if (baseFilter.onlyActive) {
      where.isActive = true;
    }

    if (baseFilter.inStock) {
      where.stock = { gt: 0 };
    }

    // Обработка фильтров по атрибутам
    if (baseFilter.attributes && Object.keys(baseFilter.attributes).length > 0) {
      const attributeFilters: any[] = [];
      
      for (const [attributeId, filterData] of Object.entries(baseFilter.attributes)) {
        const attribute = await this.prisma.attribute.findUnique({
          where: { id: attributeId },
        });

        if (!attribute) continue;

        const attributeCondition: any = {
          attributeId,
        };

        switch (attribute.type) {
          case 'SELECT_ONE':
          case 'SELECT_MANY':
            // Обрабатываем как массив, так и одиночное значение
            let optionValues: string[] = [];
            if (Array.isArray(filterData.values)) {
              optionValues = filterData.values as string[];
            } else if (typeof filterData.values === 'string' && filterData.values) {
              optionValues = [filterData.values];
            }
            
            if (optionValues.length > 0) {
              attributeCondition.optionIds = {
                hasSome: optionValues,
              };
            }
            break;
          
          case 'NUMBER':
            if (Array.isArray(filterData.values) && filterData.values.length === 2) {
              const [min, max] = filterData.values as number[];
              attributeCondition.numberValue = {
                gte: min,
                lte: max,
              };
            }
            break;
          
          case 'TEXT':
            if (typeof filterData.values === 'string' && filterData.values) {
              attributeCondition.textValue = {
                contains: filterData.values,
                mode: 'insensitive',
              };
            }
            break;
          
          case 'COLOR':
            if (typeof filterData.values === 'string' && filterData.values) {
              attributeCondition.colorValue = filterData.values;
            }
            break;
        }

        if (Object.keys(attributeCondition).length > 1) {
          attributeFilters.push(attributeCondition);
        }
      }

      if (attributeFilters.length > 0) {
        where.attributes = {
          some: {
            AND: attributeFilters,
          },
        };
      }
    }

    // Получаем товары без фильтров по категориям и брендам
    const products = await this.prisma.product.findMany({
      where,
      select: {
        id: true,
        brandId: true,
        categories: {
          select: {
            categoryId: true,
          },
        },
      },
    });

    console.log('Found products count:', products.length);
    const result = {
      categories: await this.getCategoriesWithCounts(products),
      brands: await this.getBrandsWithCounts(products),
    };
    console.log('Brands found:', result.brands.map(b => b.name));
    return result;
  }

  private async getFiltersForOtherParameters(baseFilter: ProductsFilterDto) {
    const where: Prisma.ProductWhereInput = {};
    
    // Применяем ВСЕ фильтры включая категории и бренды
    if (baseFilter.search) {
      where.OR = [
        { name: { contains: baseFilter.search, mode: 'insensitive' } },
        { sku: { contains: baseFilter.search, mode: 'insensitive' } },
        { description: { contains: baseFilter.search, mode: 'insensitive' } },
      ];
    }

    if (baseFilter.categoryIds && baseFilter.categoryIds.length > 0) {
      where.categories = {
        some: {
          categoryId: { in: baseFilter.categoryIds },
        },
      };
    }

    if (baseFilter.brandIds && baseFilter.brandIds.length > 0) {
      where.brandId = { in: baseFilter.brandIds };
    }

    if (baseFilter.minPrice !== undefined || baseFilter.maxPrice !== undefined) {
      where.price = {};
      if (baseFilter.minPrice !== undefined) {
        where.price.gte = baseFilter.minPrice;
      }
      if (baseFilter.maxPrice !== undefined) {
        where.price.lte = baseFilter.maxPrice;
      }
    }

    if (baseFilter.vehicleModelId) {
      where.vehicles = {
        some: { vehicleModelId: baseFilter.vehicleModelId },
      };
    }

    if (baseFilter.onlyActive) {
      where.isActive = true;
    }

    if (baseFilter.inStock) {
      where.stock = { gt: 0 };
    }

    // Обработка фильтров по атрибутам
    if (baseFilter.attributes && Object.keys(baseFilter.attributes).length > 0) {
      const attributeFilters: any[] = [];
      
      for (const [attributeId, filterData] of Object.entries(baseFilter.attributes)) {
        const attribute = await this.prisma.attribute.findUnique({
          where: { id: attributeId },
        });

        if (!attribute) continue;

        const attributeCondition: any = {
          attributeId,
        };

        switch (attribute.type) {
          case 'SELECT_ONE':
          case 'SELECT_MANY':
            // Обрабатываем как массив, так и одиночное значение
            let optionValues: string[] = [];
            if (Array.isArray(filterData.values)) {
              optionValues = filterData.values as string[];
            } else if (typeof filterData.values === 'string' && filterData.values) {
              optionValues = [filterData.values];
            }
            
            if (optionValues.length > 0) {
              attributeCondition.optionIds = {
                hasSome: optionValues,
              };
            }
            break;
          
          case 'NUMBER':
            if (Array.isArray(filterData.values) && filterData.values.length === 2) {
              const [min, max] = filterData.values as number[];
              attributeCondition.numberValue = {
                gte: min,
                lte: max,
              };
            }
            break;
          
          case 'TEXT':
            if (typeof filterData.values === 'string' && filterData.values) {
              attributeCondition.textValue = {
                contains: filterData.values,
                mode: 'insensitive',
              };
            }
            break;
          
          case 'COLOR':
            if (typeof filterData.values === 'string' && filterData.values) {
              attributeCondition.colorValue = filterData.values;
            }
            break;
        }

        if (Object.keys(attributeCondition).length > 1) {
          attributeFilters.push(attributeCondition);
        }
      }

      if (attributeFilters.length > 0) {
        where.attributes = {
          some: {
            AND: attributeFilters,
          },
        };
      }
    }

    // Получаем товары с учетом ВСЕХ фильтров
    const products = await this.prisma.product.findMany({
      where,
      select: {
        id: true,
        price: true,
        attributes: {
          select: {
            attributeId: true,
            optionIds: true,
            numberValue: true,
            textValue: true,
            colorValue: true,
            attribute: {
              select: {
                id: true,
                name: true,
                code: true,
                type: true,
                unit: true,
                isFilterable: true,
                options: {
                  select: {
                    id: true,
                    value: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return {
      attributes: await this.getAttributesWithCounts(products),
    };
  }

  private async getCategoriesWithCounts(products: any[]) {
    const categoryMap = new Map<string, number>();
    
    products.forEach(product => {
      product.categories.forEach((pc: any) => {
        const count = categoryMap.get(pc.categoryId) || 0;
        categoryMap.set(pc.categoryId, count + 1);
      });
    });

    const categories = await this.prisma.category.findMany({
      where: {
        id: { in: Array.from(categoryMap.keys()) },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    return categories.map(category => ({
      ...category,
      count: categoryMap.get(category.id) || 0,
    }));
  }

  private async getBrandsWithCounts(products: any[]) {
    const brandMap = new Map<string, number>();
    
    products.forEach(product => {
      if (product.brandId) {
        const count = brandMap.get(product.brandId) || 0;
        brandMap.set(product.brandId, count + 1);
      }
    });

    const brands = await this.prisma.brand.findMany({
      where: {
        id: { in: Array.from(brandMap.keys()) },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    return brands.map(brand => ({
      ...brand,
      count: brandMap.get(brand.id) || 0,
    }));
  }

  private async getAttributeFiltersWithoutSelf(baseFilter: ProductsFilterDto) {
    const where: Prisma.ProductWhereInput = {};
    
    // Применяем все фильтры КРОМЕ атрибутов
    if (baseFilter.search) {
      where.OR = [
        { name: { contains: baseFilter.search, mode: 'insensitive' } },
        { sku: { contains: baseFilter.search, mode: 'insensitive' } },
        { description: { contains: baseFilter.search, mode: 'insensitive' } },
      ];
    }

    if (baseFilter.categoryIds && baseFilter.categoryIds.length > 0) {
      where.categories = {
        some: {
          categoryId: { in: baseFilter.categoryIds },
        },
      };
    }

    if (baseFilter.brandIds && baseFilter.brandIds.length > 0) {
      where.brandId = { in: baseFilter.brandIds };
    }

    if (baseFilter.minPrice !== undefined || baseFilter.maxPrice !== undefined) {
      where.price = {};
      if (baseFilter.minPrice !== undefined) {
        where.price.gte = baseFilter.minPrice;
      }
      if (baseFilter.maxPrice !== undefined) {
        where.price.lte = baseFilter.maxPrice;
      }
    }

    if (baseFilter.vehicleModelId) {
      where.vehicles = {
        some: { vehicleModelId: baseFilter.vehicleModelId },
      };
    }

    if (baseFilter.onlyActive) {
      where.isActive = true;
    }

    if (baseFilter.inStock) {
      where.stock = { gt: 0 };
    }

    // НЕ применяем фильтры по атрибутам!

    // Получаем товары
    const products = await this.prisma.product.findMany({
      where,
      select: {
        id: true,
        attributes: {
          select: {
            attributeId: true,
            optionIds: true,
            numberValue: true,
            textValue: true,
            colorValue: true,
            attribute: {
              select: {
                id: true,
                name: true,
                code: true,
                type: true,
                unit: true,
                isFilterable: true,
                options: {
                  select: {
                    id: true,
                    value: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return this.getAttributesWithCounts(products);
  }

  private async getAttributesWithCounts(products: any[]) {
    const attributeMap = new Map<string, any>();
    
    products.forEach(product => {
      product.attributes.forEach((pa: any) => {
        if (!pa.attribute.isFilterable) return;
        
        let attrData = attributeMap.get(pa.attributeId);
        if (!attrData) {
          attrData = {
            ...pa.attribute,
            values: new Map(),
          };
          attributeMap.set(pa.attributeId, attrData);
        }

        switch (pa.attribute.type) {
          case 'SELECT_ONE':
          case 'SELECT_MANY':
            pa.optionIds?.forEach((optionId: string) => {
              const count = attrData.values.get(optionId) || 0;
              attrData.values.set(optionId, count + 1);
            });
            break;
          
          case 'NUMBER':
            if (pa.numberValue !== null) {
              if (!attrData.min || pa.numberValue < attrData.min) {
                attrData.min = pa.numberValue;
              }
              if (!attrData.max || pa.numberValue > attrData.max) {
                attrData.max = pa.numberValue;
              }
            }
            break;
          
          case 'COLOR':
            if (pa.colorValue) {
              const count = attrData.values.get(pa.colorValue) || 0;
              attrData.values.set(pa.colorValue, count + 1);
            }
            break;
        }
      });
    });

    const result: any[] = [];
    
    for (const [attributeId, attrData] of attributeMap) {
      const attribute: any = {
        id: attrData.id,
        name: attrData.name,
        code: attrData.code,
        type: attrData.type,
        unit: attrData.unit,
      };

      switch (attrData.type) {
        case 'SELECT_ONE':
        case 'SELECT_MANY':
          attribute.options = attrData.options
            .filter((opt: any) => attrData.values.has(opt.id))
            .map((opt: any) => ({
              ...opt,
              count: attrData.values.get(opt.id),
            }));
          break;
        
        case 'NUMBER':
          attribute.range = {
            min: attrData.min || 0,
            max: attrData.max || 0,
          };
          break;
        
        case 'COLOR':
          attribute.colors = Array.from(attrData.values.entries()).map(([color, count]) => ({
            value: color,
            count,
          }));
          break;
      }

      result.push(attribute);
    }

    return result;
  }
}