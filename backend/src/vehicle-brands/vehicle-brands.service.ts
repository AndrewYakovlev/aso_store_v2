import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateVehicleBrandDto,
  UpdateVehicleBrandDto,
  VehicleBrandDto,
  VehicleBrandWithCountDto,
  VehicleBrandsFilterDto,
  PaginatedVehicleBrandsDto,
} from './dto';

@Injectable()
export class VehicleBrandsService {
  constructor(private prisma: PrismaService) {}

  async create(createVehicleBrandDto: CreateVehicleBrandDto): Promise<VehicleBrandDto> {
    // Check if external ID already exists
    const existingByExternalId = await this.prisma.vehicleBrand.findUnique({
      where: { externalId: createVehicleBrandDto.externalId },
    });
    if (existingByExternalId) {
      throw new ConflictException('Vehicle brand with this external ID already exists');
    }

    // Check if slug already exists
    const existingBySlug = await this.prisma.vehicleBrand.findUnique({
      where: { slug: createVehicleBrandDto.slug },
    });
    if (existingBySlug) {
      throw new ConflictException('Vehicle brand with this slug already exists');
    }

    const brand = await this.prisma.vehicleBrand.create({
      data: createVehicleBrandDto,
    });

    return this.mapToDto(brand);
  }

  async findAll(filter: VehicleBrandsFilterDto): Promise<PaginatedVehicleBrandsDto> {
    const {
      search,
      popular,
      onlyActive,
      country,
      page = 1,
      limit = 20,
      sortBy = 'sortOrder',
      sortOrder = 'asc',
    } = filter;

    const where: Prisma.VehicleBrandWhereInput = {};

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameCyrillic: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Popular filter
    if (popular !== undefined) {
      where.popular = popular;
    }

    // Active filter
    if (onlyActive) {
      where.isActive = true;
    }

    // Country filter
    if (country) {
      where.country = country;
    }

    // Count total
    const total = await this.prisma.vehicleBrand.count({ where });

    // Get brands with models count
    const brands = await this.prisma.vehicleBrand.findMany({
      where,
      include: {
        _count: {
          select: { models: true },
        },
      },
      orderBy: 
        sortBy === 'name' || sortBy === 'nameCyrillic' 
          ? { [sortBy]: sortOrder }
          : [
              { popular: 'desc' }, // Popular first
              { [sortBy]: sortOrder }
            ],
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: brands.map(brand => ({
        ...this.mapToDto(brand),
        modelsCount: brand._count.models,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAllCountries(): Promise<string[]> {
    const countries = await this.prisma.vehicleBrand.findMany({
      where: {
        country: { not: null },
        isActive: true,
      },
      select: { country: true },
      distinct: ['country'],
      orderBy: { country: 'asc' },
    });

    return countries.map(c => c.country).filter(Boolean) as string[];
  }

  async findPopular(limit: number = 15): Promise<VehicleBrandWithCountDto[]> {
    const brands = await this.prisma.vehicleBrand.findMany({
      where: {
        popular: true,
        isActive: true,
      },
      include: {
        _count: {
          select: { models: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
      take: limit,
    });

    return brands.map(brand => ({
      ...this.mapToDto(brand),
      modelsCount: brand._count.models,
    }));
  }

  async findBySlug(slug: string): Promise<VehicleBrandDto> {
    const brand = await this.prisma.vehicleBrand.findUnique({
      where: { slug },
    });

    if (!brand) {
      throw new NotFoundException('Vehicle brand not found');
    }

    return this.mapToDto(brand);
  }

  async findById(id: string): Promise<VehicleBrandDto> {
    const brand = await this.prisma.vehicleBrand.findUnique({
      where: { id },
    });

    if (!brand) {
      throw new NotFoundException('Vehicle brand not found');
    }

    return this.mapToDto(brand);
  }

  async update(id: string, updateVehicleBrandDto: UpdateVehicleBrandDto): Promise<VehicleBrandDto> {
    // Check if brand exists
    const existing = await this.prisma.vehicleBrand.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Vehicle brand not found');
    }

    // Check if slug is being updated and already exists
    if (updateVehicleBrandDto.slug && updateVehicleBrandDto.slug !== existing.slug) {
      const existingBySlug = await this.prisma.vehicleBrand.findUnique({
        where: { slug: updateVehicleBrandDto.slug },
      });
      if (existingBySlug) {
        throw new ConflictException('Vehicle brand with this slug already exists');
      }
    }

    const brand = await this.prisma.vehicleBrand.update({
      where: { id },
      data: updateVehicleBrandDto,
    });

    return this.mapToDto(brand);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.vehicleBrand.findUnique({
      where: { id },
      include: {
        _count: {
          select: { models: true },
        },
      },
    });
    if (!existing) {
      throw new NotFoundException('Vehicle brand not found');
    }

    // Check if brand has models
    if (existing._count.models > 0) {
      throw new ConflictException(
        `Cannot delete vehicle brand with ${existing._count.models} models`,
      );
    }

    await this.prisma.vehicleBrand.delete({
      where: { id },
    });
  }

  private mapToDto(brand: any): VehicleBrandDto {
    return {
      id: brand.id,
      externalId: brand.externalId,
      name: brand.name,
      nameCyrillic: brand.nameCyrillic,
      slug: brand.slug,
      country: brand.country,
      logo: brand.logo,
      popular: brand.popular,
      isActive: brand.isActive,
      sortOrder: brand.sortOrder,
      createdAt: brand.createdAt,
      updatedAt: brand.updatedAt,
    };
  }
}