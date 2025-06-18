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
}