import { ApiProperty } from '@nestjs/swagger';
import { Category } from '@prisma/client';

export class CategoryDto {
  @ApiProperty({
    description: 'Category ID',
    example: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Category name',
    example: 'Моторные масла',
  })
  name: string;

  @ApiProperty({
    description: 'URL-friendly slug',
    example: 'motornye-masla',
  })
  slug: string;

  @ApiProperty({
    description: 'Category description',
    example: 'Широкий выбор моторных масел для всех типов двигателей',
    required: false,
  })
  description?: string | null;

  @ApiProperty({
    description: 'Parent category ID',
    example: 'uuid-parent-category',
    required: false,
  })
  parentId?: string | null;

  @ApiProperty({
    description: 'Is category active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Sort order',
    example: 0,
  })
  sortOrder: number;

  @ApiProperty({
    description: 'Product count in category',
    example: 42,
    required: false,
  })
  productCount?: number;

  @ApiProperty({
    description: 'Subcategories',
    type: [CategoryDto],
    required: false,
  })
  children?: CategoryDto[];

  @ApiProperty({
    description: 'Parent category',
    type: CategoryDto,
    required: false,
  })
  parent?: CategoryDto;

  constructor(
    category: Partial<Category> & {
      _count?: { products: number };
      children?: any[];
      parent?: any;
    },
  ) {
    this.id = category.id!;
    this.name = category.name!;
    this.slug = category.slug!;
    this.description = category.description || null;
    this.parentId = category.parentId || null;
    this.isActive = category.isActive ?? true;
    this.sortOrder = category.sortOrder ?? 0;

    if (category._count) {
      this.productCount = category._count.products;
    }

    if (category.children) {
      this.children = category.children.map((child) => new CategoryDto(child));
    }

    if (category.parent) {
      this.parent = new CategoryDto(category.parent);
    }
  }
}

export class CategoryTreeDto extends CategoryDto {
  @ApiProperty({
    description: 'Subcategories',
    type: [CategoryTreeDto],
  })
  children: CategoryTreeDto[];

  constructor(category: any) {
    super(category);
    this.children =
      category.children?.map((child: any) => new CategoryTreeDto(child)) || [];
  }
}
