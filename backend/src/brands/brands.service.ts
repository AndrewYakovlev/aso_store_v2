import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateBrandDto,
  UpdateBrandDto,
  BrandDto,
  BrandWithCountDto,
  BrandsFilterDto,
  PaginatedBrandsDto,
} from './dto';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  async create(createBrandDto: CreateBrandDto): Promise<BrandDto> {
    // Check if slug already exists
    const existingBySlug = await this.prisma.brand.findUnique({
      where: { slug: createBrandDto.slug },
    });
    if (existingBySlug) {
      throw new ConflictException('Brand with this slug already exists');
    }

    // Check if name already exists
    const existingByName = await this.prisma.brand.findUnique({
      where: { name: createBrandDto.name },
    });
    if (existingByName) {
      throw new ConflictException('Brand with this name already exists');
    }

    const brand = await this.prisma.brand.create({
      data: createBrandDto,
    });

    return this.mapToDto(brand);
  }

  async findAll(filter: BrandsFilterDto): Promise<PaginatedBrandsDto> {
    const {
      search,
      onlyActive,
      page = 1,
      limit = 20,
      sortBy = 'sortOrder',
      sortOrder = 'asc',
    } = filter;

    const where: Prisma.BrandWhereInput = {};

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Active filter
    if (onlyActive) {
      where.isActive = true;
    }

    // Count total
    const total = await this.prisma.brand.count({ where });

    // Get brands with product count
    const brands = await this.prisma.brand.findMany({
      where,
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: brands.map(brand => ({
        ...this.mapToDto(brand),
        productsCount: brand._count.products,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findBySlug(slug: string): Promise<BrandDto> {
    const brand = await this.prisma.brand.findUnique({
      where: { slug },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    return this.mapToDto(brand);
  }

  async findById(id: string): Promise<BrandDto> {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    return this.mapToDto(brand);
  }

  async update(id: string, updateBrandDto: UpdateBrandDto): Promise<BrandDto> {
    // Check if brand exists
    const existing = await this.prisma.brand.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Brand not found');
    }

    // Check if slug is being updated and already exists
    if (updateBrandDto.slug && updateBrandDto.slug !== existing.slug) {
      const existingBySlug = await this.prisma.brand.findUnique({
        where: { slug: updateBrandDto.slug },
      });
      if (existingBySlug) {
        throw new ConflictException('Brand with this slug already exists');
      }
    }

    // Check if name is being updated and already exists
    if (updateBrandDto.name && updateBrandDto.name !== existing.name) {
      const existingByName = await this.prisma.brand.findUnique({
        where: { name: updateBrandDto.name },
      });
      if (existingByName) {
        throw new ConflictException('Brand with this name already exists');
      }
    }

    const brand = await this.prisma.brand.update({
      where: { id },
      data: updateBrandDto,
    });

    return this.mapToDto(brand);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    if (!existing) {
      throw new NotFoundException('Brand not found');
    }

    // Check if brand has products
    if (existing._count.products > 0) {
      throw new ConflictException(
        `Cannot delete brand with ${existing._count.products} products`,
      );
    }

    await this.prisma.brand.delete({
      where: { id },
    });
  }

  private mapToDto(brand: any): BrandDto {
    return {
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      description: brand.description,
      logo: brand.logo,
      website: brand.website,
      country: brand.country,
      isActive: brand.isActive,
      sortOrder: brand.sortOrder,
      createdAt: brand.createdAt,
      updatedAt: brand.updatedAt,
    };
  }
}
