import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateProductVehicleDto,
  UpdateProductVehicleDto,
  ProductVehicleDto,
  BulkCreateProductVehicleDto,
} from './dto';

@Injectable()
export class ProductVehiclesService {
  constructor(private prisma: PrismaService) {}

  async create(productId: string, createDto: CreateProductVehicleDto): Promise<ProductVehicleDto> {
    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if vehicle model exists
    const vehicleModel = await this.prisma.vehicleModel.findUnique({
      where: { id: createDto.vehicleModelId },
    });
    if (!vehicleModel) {
      throw new NotFoundException('Vehicle model not found');
    }

    // Validate year range
    if (createDto.yearFrom && createDto.yearTo && createDto.yearFrom > createDto.yearTo) {
      throw new BadRequestException('Year from cannot be greater than year to');
    }

    // Validate against vehicle model years
    if (createDto.yearFrom && createDto.yearFrom < vehicleModel.yearFrom) {
      throw new BadRequestException(`Year from cannot be less than model start year (${vehicleModel.yearFrom})`);
    }
    if (createDto.yearTo && vehicleModel.yearTo && createDto.yearTo > vehicleModel.yearTo) {
      throw new BadRequestException(`Year to cannot be greater than model end year (${vehicleModel.yearTo})`);
    }

    const productVehicle = await this.prisma.productVehicle.create({
      data: {
        productId,
        ...createDto,
      },
      include: {
        vehicleModel: {
          include: {
            brand: true,
          },
        },
      },
    });

    return this.mapToDto(productVehicle);
  }

  async bulkCreate(productId: string, bulkCreateDto: BulkCreateProductVehicleDto): Promise<ProductVehicleDto[]> {
    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Delete existing vehicle connections
    await this.prisma.productVehicle.deleteMany({
      where: { productId },
    });

    // Create new connections
    const results: ProductVehicleDto[] = [];
    for (const vehicleData of bulkCreateDto.vehicles) {
      const result = await this.create(productId, vehicleData);
      results.push(result);
    }

    return results;
  }

  async findByProduct(productId: string): Promise<ProductVehicleDto[]> {
    const productVehicles = await this.prisma.productVehicle.findMany({
      where: { productId },
      include: {
        vehicleModel: {
          include: {
            brand: true,
          },
        },
      },
      orderBy: [
        { vehicleModel: { brand: { name: 'asc' } } },
        { vehicleModel: { name: 'asc' } },
        { yearFrom: 'asc' },
      ],
    });

    return productVehicles.map(pv => this.mapToDto(pv));
  }

  async findByVehicleModel(
    vehicleModelId: string,
    year?: number,
  ): Promise<{ productId: string; fitmentNotes?: string; yearFrom?: number; yearTo?: number }[]> {
    const where: any = { vehicleModelId };

    // If year is specified, filter by year range
    if (year) {
      where.AND = [
        {
          OR: [
            { yearFrom: null },
            { yearFrom: { lte: year } },
          ],
        },
        {
          OR: [
            { yearTo: null },
            { yearTo: { gte: year } },
          ],
        },
      ];
    }

    const productVehicles = await this.prisma.productVehicle.findMany({
      where,
      select: {
        productId: true,
        fitmentNotes: true,
        yearFrom: true,
        yearTo: true,
      },
    });

    return productVehicles.map(pv => ({
      productId: pv.productId,
      fitmentNotes: pv.fitmentNotes || undefined,
      yearFrom: pv.yearFrom || undefined,
      yearTo: pv.yearTo || undefined,
    }));
  }

  async update(
    productId: string,
    vehicleId: string,
    updateDto: UpdateProductVehicleDto,
  ): Promise<ProductVehicleDto> {
    // Check if connection exists
    const existing = await this.prisma.productVehicle.findFirst({
      where: {
        id: vehicleId,
        productId,
      },
    });
    if (!existing) {
      throw new NotFoundException('Product vehicle connection not found');
    }

    // Validate year range if updating
    if (updateDto.yearFrom !== undefined || updateDto.yearTo !== undefined) {
      const yearFrom = updateDto.yearFrom ?? existing.yearFrom;
      const yearTo = updateDto.yearTo ?? existing.yearTo;
      
      if (yearFrom && yearTo && yearFrom > yearTo) {
        throw new BadRequestException('Year from cannot be greater than year to');
      }

      // Validate against vehicle model years
      const vehicleModel = await this.prisma.vehicleModel.findUnique({
        where: { id: existing.vehicleModelId },
      });
      
      if (!vehicleModel) {
        throw new BadRequestException('Vehicle model not found');
      }
      
      if (yearFrom && yearFrom < vehicleModel.yearFrom) {
        throw new BadRequestException(`Year from cannot be less than model start year (${vehicleModel.yearFrom})`);
      }
      if (yearTo && vehicleModel.yearTo && yearTo > vehicleModel.yearTo) {
        throw new BadRequestException(`Year to cannot be greater than model end year (${vehicleModel.yearTo})`);
      }
    }

    const updated = await this.prisma.productVehicle.update({
      where: { id: vehicleId },
      data: updateDto,
      include: {
        vehicleModel: {
          include: {
            brand: true,
          },
        },
      },
    });

    return this.mapToDto(updated);
  }

  async remove(productId: string, vehicleId: string): Promise<void> {
    const existing = await this.prisma.productVehicle.findFirst({
      where: {
        id: vehicleId,
        productId,
      },
    });
    if (!existing) {
      throw new NotFoundException('Product vehicle connection not found');
    }

    await this.prisma.productVehicle.delete({
      where: { id: vehicleId },
    });
  }

  private mapToDto(productVehicle: any): ProductVehicleDto {
    return {
      id: productVehicle.id,
      productId: productVehicle.productId,
      vehicleModelId: productVehicle.vehicleModelId,
      yearFrom: productVehicle.yearFrom,
      yearTo: productVehicle.yearTo,
      fitmentNotes: productVehicle.fitmentNotes,
      isUniversal: productVehicle.isUniversal,
      createdAt: productVehicle.createdAt,
      updatedAt: productVehicle.updatedAt,
      vehicleModel: productVehicle.vehicleModel ? {
        id: productVehicle.vehicleModel.id,
        externalId: productVehicle.vehicleModel.externalId,
        brandId: productVehicle.vehicleModel.brandId,
        name: productVehicle.vehicleModel.name,
        nameCyrillic: productVehicle.vehicleModel.nameCyrillic,
        slug: productVehicle.vehicleModel.slug,
        class: productVehicle.vehicleModel.class,
        yearFrom: productVehicle.vehicleModel.yearFrom,
        yearTo: productVehicle.vehicleModel.yearTo,
        image: productVehicle.vehicleModel.image,
        isActive: productVehicle.vehicleModel.isActive,
        sortOrder: productVehicle.vehicleModel.sortOrder,
        createdAt: productVehicle.vehicleModel.createdAt,
        updatedAt: productVehicle.vehicleModel.updatedAt,
        brand: productVehicle.vehicleModel.brand ? {
          id: productVehicle.vehicleModel.brand.id,
          externalId: productVehicle.vehicleModel.brand.externalId,
          name: productVehicle.vehicleModel.brand.name,
          nameCyrillic: productVehicle.vehicleModel.brand.nameCyrillic,
          slug: productVehicle.vehicleModel.brand.slug,
          country: productVehicle.vehicleModel.brand.country,
          logo: productVehicle.vehicleModel.brand.logo,
          popular: productVehicle.vehicleModel.brand.popular,
          isActive: productVehicle.vehicleModel.brand.isActive,
          sortOrder: productVehicle.vehicleModel.brand.sortOrder,
          createdAt: productVehicle.vehicleModel.brand.createdAt,
          updatedAt: productVehicle.vehicleModel.brand.updatedAt,
        } : undefined,
      } : undefined,
    };
  }
}