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
    const { categoryIds, images, ...productData } = createProductDto;

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
        categories: {
          create: categoryIds.map(categoryId => ({
            category: { connect: { id: categoryId } },
          })),
        },
      },
      include: {
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
      minPrice,
      maxPrice,
      onlyActive,
      inStock,
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

    // Count total
    const total = await this.prisma.product.count({ where });

    // Get products
    const products = await this.prisma.product.findMany({
      where,
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        specifications: true,
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
        categories: {
          include: {
            category: true,
          },
        },
        specifications: true,
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
        categories: {
          include: {
            category: true,
          },
        },
        specifications: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.mapToDto(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<ProductDto> {
    const { categoryIds, images, ...productData } = updateProductDto;

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
        categories: {
          include: {
            category: true,
          },
        },
        specifications: true,
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
    if (product.specifications) {
      dto.specifications = product.specifications;
    }

    return dto;
  }
}