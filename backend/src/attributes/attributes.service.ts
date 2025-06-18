import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttributeType } from '@prisma/client';
import {
  AttributeDto,
  CreateAttributeDto,
  UpdateAttributeDto,
  CategoryAttributeDto,
  AssignAttributesToCategoryDto,
  ProductAttributeValueDto,
  SetProductAttributeDto,
  BulkSetProductAttributesDto,
} from './dto';

@Injectable()
export class AttributesService {
  constructor(private readonly prisma: PrismaService) {}

  // Attribute management
  async create(createAttributeDto: CreateAttributeDto): Promise<AttributeDto> {
    const { options, ...attributeData } = createAttributeDto;

    // Validate that SELECT types have options
    if (
      (attributeData.type === AttributeType.SELECT_ONE || 
       attributeData.type === AttributeType.SELECT_MANY) &&
      (!options || options.length === 0)
    ) {
      throw new BadRequestException('SELECT type attributes must have options');
    }

    // Validate that only SELECT types have options
    if (
      attributeData.type !== AttributeType.SELECT_ONE && 
      attributeData.type !== AttributeType.SELECT_MANY &&
      options && options.length > 0
    ) {
      throw new BadRequestException('Only SELECT type attributes can have options');
    }

    const attribute = await this.prisma.attribute.create({
      data: {
        ...attributeData,
        options: options ? {
          create: options.map((opt, index) => ({
            value: opt.value,
            sortOrder: opt.sortOrder ?? index,
          })),
        } : undefined,
      },
      include: {
        options: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return this.mapToAttributeDto(attribute);
  }

  async findAll(): Promise<AttributeDto[]> {
    const attributes = await this.prisma.attribute.findMany({
      include: {
        options: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return attributes.map(attr => this.mapToAttributeDto(attr));
  }

  async findOne(id: string): Promise<AttributeDto> {
    const attribute = await this.prisma.attribute.findUnique({
      where: { id },
      include: {
        options: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!attribute) {
      throw new NotFoundException(`Attribute with ID ${id} not found`);
    }

    return this.mapToAttributeDto(attribute);
  }

  async findByCode(code: string): Promise<AttributeDto> {
    const attribute = await this.prisma.attribute.findUnique({
      where: { code },
      include: {
        options: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!attribute) {
      throw new NotFoundException(`Attribute with code ${code} not found`);
    }

    return this.mapToAttributeDto(attribute);
  }

  async update(id: string, updateAttributeDto: UpdateAttributeDto): Promise<AttributeDto> {
    const attribute = await this.prisma.attribute.findUnique({
      where: { id },
    });

    if (!attribute) {
      throw new NotFoundException(`Attribute with ID ${id} not found`);
    }

    // Don't allow changing type if attribute has values
    if (updateAttributeDto.type && updateAttributeDto.type !== attribute.type) {
      const hasValues = await this.prisma.productAttribute.count({
        where: { attributeId: id },
      });

      if (hasValues > 0) {
        throw new BadRequestException('Cannot change attribute type when it has values');
      }
    }

    // Отделяем options от остальных данных
    const { options, ...attributeData } = updateAttributeDto;
    
    const updated = await this.prisma.attribute.update({
      where: { id },
      data: {
        ...attributeData,
        // Если есть options, обновляем их
        ...(options && {
          options: {
            deleteMany: {}, // Удаляем все старые опции
            create: options, // Создаем новые
          },
        }),
      },
      include: {
        options: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return this.mapToAttributeDto(updated);
  }

  async remove(id: string): Promise<void> {
    const attribute = await this.prisma.attribute.findUnique({
      where: { id },
    });

    if (!attribute) {
      throw new NotFoundException(`Attribute with ID ${id} not found`);
    }

    await this.prisma.attribute.delete({
      where: { id },
    });
  }

  // Category attributes
  async getCategoryAttributes(categoryId: string): Promise<CategoryAttributeDto[]> {
    const categoryAttributes = await this.prisma.categoryAttribute.findMany({
      where: { categoryId },
      include: {
        attribute: {
          include: {
            options: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return categoryAttributes.map(ca => ({
      categoryId: ca.categoryId,
      attributeId: ca.attributeId,
      attribute: this.mapToAttributeDto(ca.attribute),
      isRequired: ca.isRequired,
      sortOrder: ca.sortOrder,
    }));
  }

  async assignAttributesToCategory(
    categoryId: string,
    dto: AssignAttributesToCategoryDto,
  ): Promise<CategoryAttributeDto[]> {
    // Check if category exists
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    // Check if all attributes exist
    const attributes = await this.prisma.attribute.findMany({
      where: { id: { in: dto.attributeIds } },
    });

    if (attributes.length !== dto.attributeIds.length) {
      throw new BadRequestException('Some attributes not found');
    }

    // Get existing assignments
    const existing = await this.prisma.categoryAttribute.findMany({
      where: {
        categoryId,
        attributeId: { in: dto.attributeIds },
      },
    });

    const existingIds = new Set(existing.map(e => e.attributeId));
    const newAttributeIds = dto.attributeIds.filter(id => !existingIds.has(id));

    // Create new assignments
    if (newAttributeIds.length > 0) {
      await this.prisma.categoryAttribute.createMany({
        data: newAttributeIds.map((attributeId, index) => ({
          categoryId,
          attributeId,
          isRequired: dto.isRequired ?? false,
          sortOrder: existing.length + index,
        })),
      });
    }

    return this.getCategoryAttributes(categoryId);
  }

  async removeAttributeFromCategory(
    categoryId: string,
    attributeId: string,
  ): Promise<void> {
    const categoryAttribute = await this.prisma.categoryAttribute.findFirst({
      where: { categoryId, attributeId },
    });

    if (!categoryAttribute) {
      throw new NotFoundException('Category attribute assignment not found');
    }

    await this.prisma.categoryAttribute.delete({
      where: { id: categoryAttribute.id },
    });
  }

  // Product attributes
  async getProductAttributes(productId: string): Promise<ProductAttributeValueDto[]> {
    const productAttributes = await this.prisma.productAttribute.findMany({
      where: { productId },
      include: {
        attribute: {
          include: {
            options: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });

    return productAttributes.map(pa => ({
      attributeId: pa.attributeId,
      attribute: this.mapToAttributeDto(pa.attribute),
      textValue: pa.textValue ?? undefined,
      numberValue: pa.numberValue ?? undefined,
      colorValue: pa.colorValue ?? undefined,
      optionIds: pa.optionIds,
    }));
  }

  async setProductAttribute(
    productId: string,
    dto: SetProductAttributeDto,
  ): Promise<ProductAttributeValueDto> {
    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Check if attribute exists
    const attribute = await this.prisma.attribute.findUnique({
      where: { id: dto.attributeId },
      include: { options: true },
    });

    if (!attribute) {
      throw new NotFoundException(`Attribute with ID ${dto.attributeId} not found`);
    }

    // Validate value based on attribute type
    this.validateAttributeValue(attribute, dto);

    // Upsert product attribute
    const productAttribute = await this.prisma.productAttribute.upsert({
      where: {
        productId_attributeId: {
          productId,
          attributeId: dto.attributeId,
        },
      },
      create: {
        productId,
        attributeId: dto.attributeId,
        textValue: dto.textValue,
        numberValue: dto.numberValue,
        colorValue: dto.colorValue,
        optionIds: dto.optionIds || [],
      },
      update: {
        textValue: dto.textValue,
        numberValue: dto.numberValue,
        colorValue: dto.colorValue,
        optionIds: dto.optionIds || [],
      },
      include: {
        attribute: {
          include: {
            options: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });

    return {
      attributeId: productAttribute.attributeId,
      attribute: this.mapToAttributeDto(productAttribute.attribute),
      textValue: productAttribute.textValue ?? undefined,
      numberValue: productAttribute.numberValue ?? undefined,
      colorValue: productAttribute.colorValue ?? undefined,
      optionIds: productAttribute.optionIds,
    };
  }

  async setProductAttributes(
    productId: string,
    dto: BulkSetProductAttributesDto,
  ): Promise<ProductAttributeValueDto[]> {
    // Set each attribute
    const results = await Promise.all(
      dto.attributes.map(attr => this.setProductAttribute(productId, attr)),
    );

    return results;
  }

  async removeProductAttribute(
    productId: string,
    attributeId: string,
  ): Promise<void> {
    const productAttribute = await this.prisma.productAttribute.findFirst({
      where: { productId, attributeId },
    });

    if (!productAttribute) {
      throw new NotFoundException('Product attribute not found');
    }

    await this.prisma.productAttribute.delete({
      where: { id: productAttribute.id },
    });
  }

  // Private methods
  private validateAttributeValue(attribute: any, dto: SetProductAttributeDto): void {
    switch (attribute.type) {
      case AttributeType.TEXT:
        if (!dto.textValue) {
          throw new BadRequestException('Text value is required for TEXT type attribute');
        }
        break;

      case AttributeType.NUMBER:
        if (dto.numberValue === null || dto.numberValue === undefined) {
          throw new BadRequestException('Number value is required for NUMBER type attribute');
        }
        break;

      case AttributeType.COLOR:
        if (!dto.colorValue) {
          throw new BadRequestException('Color value is required for COLOR type attribute');
        }
        break;

      case AttributeType.SELECT_ONE:
        if (!dto.optionIds || dto.optionIds.length !== 1) {
          throw new BadRequestException('Exactly one option must be selected for SELECT_ONE type');
        }
        // Validate option exists
        const validOptionIds = new Set(attribute.options.map((o: any) => o.id));
        if (!validOptionIds.has(dto.optionIds[0])) {
          throw new BadRequestException('Invalid option ID');
        }
        break;

      case AttributeType.SELECT_MANY:
        if (!dto.optionIds || dto.optionIds.length === 0) {
          throw new BadRequestException('At least one option must be selected for SELECT_MANY type');
        }
        // Validate all options exist
        const validOptions = new Set(attribute.options.map((o: any) => o.id));
        for (const optionId of dto.optionIds) {
          if (!validOptions.has(optionId)) {
            throw new BadRequestException(`Invalid option ID: ${optionId}`);
          }
        }
        break;
    }
  }

  private mapToAttributeDto(attribute: any): AttributeDto {
    return {
      id: attribute.id,
      code: attribute.code,
      name: attribute.name,
      type: attribute.type,
      unit: attribute.unit ?? undefined,
      isRequired: attribute.isRequired,
      isFilterable: attribute.isFilterable,
      sortOrder: attribute.sortOrder,
      options: attribute.options?.map((opt: any) => ({
        id: opt.id,
        attributeId: opt.attributeId,
        value: opt.value,
        sortOrder: opt.sortOrder,
      })),
      createdAt: attribute.createdAt,
      updatedAt: attribute.updatedAt,
    };
  }
}