import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateVehicleModelDto,
  UpdateVehicleModelDto,
  VehicleModelDto,
  VehicleModelsFilterDto,
  PaginatedVehicleModelsDto,
} from './dto';

@Injectable()
export class VehicleModelsService {
  constructor(private prisma: PrismaService) {}

  async create(createVehicleModelDto: CreateVehicleModelDto): Promise<VehicleModelDto> {
    // Validate yearFrom <= yearTo
    if (createVehicleModelDto.yearTo && createVehicleModelDto.yearFrom > createVehicleModelDto.yearTo) {
      throw new BadRequestException('Year from cannot be greater than year to');
    }

    // Check if external ID already exists
    const existingByExternalId = await this.prisma.vehicleModel.findUnique({
      where: { externalId: createVehicleModelDto.externalId },
    });
    if (existingByExternalId) {
      throw new ConflictException('Vehicle model with this external ID already exists');
    }

    // Check if slug already exists
    const existingBySlug = await this.prisma.vehicleModel.findUnique({
      where: { slug: createVehicleModelDto.slug },
    });
    if (existingBySlug) {
      throw new ConflictException('Vehicle model with this slug already exists');
    }

    // Check if brand exists
    const brand = await this.prisma.vehicleBrand.findUnique({
      where: { id: createVehicleModelDto.brandId },
    });
    if (!brand) {
      throw new NotFoundException('Vehicle brand not found');
    }

    const model = await this.prisma.vehicleModel.create({
      data: createVehicleModelDto,
      include: { brand: true },
    });

    return this.mapToDto(model);
  }

  async findAll(filter: VehicleModelsFilterDto): Promise<PaginatedVehicleModelsDto> {
    const {
      search,
      brandId,
      class: vehicleClass,
      yearFrom,
      yearTo,
      onlyActive,
      page = 1,
      limit = 20,
      sortBy = 'sortOrder',
      sortOrder = 'asc',
    } = filter;

    const where: Prisma.VehicleModelWhereInput = {};

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameCyrillic: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Brand filter
    if (brandId) {
      where.brandId = brandId;
    }

    // Class filter
    if (vehicleClass) {
      where.class = vehicleClass;
    }

    // Year range filter
    if (yearFrom || yearTo) {
      where.AND = [];
      
      if (yearFrom) {
        where.AND.push({
          OR: [
            { yearTo: null }, // Still in production
            { yearTo: { gte: yearFrom } }, // Ended after yearFrom
          ],
        });
      }
      
      if (yearTo) {
        where.AND.push({
          yearFrom: { lte: yearTo }, // Started before yearTo
        });
      }
    }

    // Active filter
    if (onlyActive) {
      where.isActive = true;
    }

    // Count total
    const total = await this.prisma.vehicleModel.count({ where });

    // Get models with brand
    const models = await this.prisma.vehicleModel.findMany({
      where,
      include: { brand: true },
      orderBy: 
        sortBy === 'name' || sortBy === 'nameCyrillic' || sortBy === 'yearFrom'
          ? { [sortBy]: sortOrder }
          : [
              { sortOrder: sortOrder },
              { yearFrom: 'desc' }, // Newer models first
            ],
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: models.map(model => this.mapToDto(model)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByBrand(brandSlug: string): Promise<VehicleModelDto[]> {
    const brand = await this.prisma.vehicleBrand.findUnique({
      where: { slug: brandSlug },
    });

    if (!brand) {
      throw new NotFoundException('Vehicle brand not found');
    }

    const models = await this.prisma.vehicleModel.findMany({
      where: { 
        brandId: brand.id,
        isActive: true,
      },
      include: { brand: true },
      orderBy: [
        { sortOrder: 'asc' },
        { yearFrom: 'desc' },
      ],
    });

    return models.map(model => this.mapToDto(model));
  }

  async findBySlug(slug: string): Promise<VehicleModelDto> {
    const model = await this.prisma.vehicleModel.findUnique({
      where: { slug },
      include: { brand: true },
    });

    if (!model) {
      throw new NotFoundException('Vehicle model not found');
    }

    return this.mapToDto(model);
  }

  async findById(id: string): Promise<VehicleModelDto> {
    const model = await this.prisma.vehicleModel.findUnique({
      where: { id },
      include: { brand: true },
    });

    if (!model) {
      throw new NotFoundException('Vehicle model not found');
    }

    return this.mapToDto(model);
  }

  async update(id: string, updateVehicleModelDto: UpdateVehicleModelDto): Promise<VehicleModelDto> {
    // Check if model exists
    const existing = await this.prisma.vehicleModel.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Vehicle model not found');
    }

    // Validate yearFrom <= yearTo
    const yearFrom = updateVehicleModelDto.yearFrom ?? existing.yearFrom;
    const yearTo = updateVehicleModelDto.yearTo ?? existing.yearTo;
    if (yearTo && yearFrom > yearTo) {
      throw new BadRequestException('Year from cannot be greater than year to');
    }

    // Check if slug is being updated and already exists
    if (updateVehicleModelDto.slug && updateVehicleModelDto.slug !== existing.slug) {
      const existingBySlug = await this.prisma.vehicleModel.findUnique({
        where: { slug: updateVehicleModelDto.slug },
      });
      if (existingBySlug) {
        throw new ConflictException('Vehicle model with this slug already exists');
      }
    }

    // Check if brand exists (if updating brandId)
    if (updateVehicleModelDto.brandId && updateVehicleModelDto.brandId !== existing.brandId) {
      const brand = await this.prisma.vehicleBrand.findUnique({
        where: { id: updateVehicleModelDto.brandId },
      });
      if (!brand) {
        throw new NotFoundException('Vehicle brand not found');
      }
    }

    const model = await this.prisma.vehicleModel.update({
      where: { id },
      data: updateVehicleModelDto,
      include: { brand: true },
    });

    return this.mapToDto(model);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.vehicleModel.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    if (!existing) {
      throw new NotFoundException('Vehicle model not found');
    }

    // Check if model has products
    if (existing._count.products > 0) {
      throw new ConflictException(
        `Cannot delete vehicle model with ${existing._count.products} linked products`,
      );
    }

    await this.prisma.vehicleModel.delete({
      where: { id },
    });
  }

  async getAvailableClasses(): Promise<string[]> {
    const classes = await this.prisma.vehicleModel.findMany({
      where: { isActive: true },
      select: { class: true },
      distinct: ['class'],
      orderBy: { class: 'asc' },
    });

    return classes.map(c => c.class);
  }

  private mapToDto(model: any): VehicleModelDto {
    return {
      id: model.id,
      externalId: model.externalId,
      brandId: model.brandId,
      name: model.name,
      nameCyrillic: model.nameCyrillic,
      slug: model.slug,
      class: model.class,
      yearFrom: model.yearFrom,
      yearTo: model.yearTo,
      image: model.image,
      isActive: model.isActive,
      sortOrder: model.sortOrder,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      brand: model.brand ? {
        id: model.brand.id,
        externalId: model.brand.externalId,
        name: model.brand.name,
        nameCyrillic: model.brand.nameCyrillic,
        slug: model.brand.slug,
        country: model.brand.country,
        logo: model.brand.logo,
        popular: model.brand.popular,
        isActive: model.brand.isActive,
        sortOrder: model.brand.sortOrder,
        createdAt: model.brand.createdAt,
        updatedAt: model.brand.updatedAt,
      } : undefined,
    };
  }
}