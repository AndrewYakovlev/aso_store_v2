import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryDto,
  CategoryTreeDto,
} from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryDto> {
    // Check if slug already exists
    const existingCategory = await this.prisma.category.findUnique({
      where: { slug: createCategoryDto.slug },
    });

    if (existingCategory) {
      throw new ConflictException('Category with this slug already exists');
    }

    // Validate parent category if provided
    if (createCategoryDto.parentId) {
      const parentExists = await this.prisma.category.findUnique({
        where: { id: createCategoryDto.parentId },
      });

      if (!parentExists) {
        throw new NotFoundException('Parent category not found');
      }
    }

    const category = await this.prisma.category.create({
      data: createCategoryDto,
      include: {
        parent: true,
        _count: {
          select: { products: true },
        },
      },
    });

    return new CategoryDto(category);
  }

  async findAll(
    onlyActive: boolean = true,
    includeProductCount: boolean = true,
  ): Promise<CategoryDto[]> {
    const where: Prisma.CategoryWhereInput = {};

    if (onlyActive) {
      where.isActive = true;
    }

    const categories = await this.prisma.category.findMany({
      where,
      include: {
        ...(includeProductCount && {
          _count: {
            select: { products: true },
          },
        }),
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    return categories.map((category) => new CategoryDto(category));
  }

  async findTree(onlyActive: boolean = true): Promise<CategoryTreeDto[]> {
    const where: Prisma.CategoryWhereInput = {
      parentId: null,
    };

    if (onlyActive) {
      where.isActive = true;
    }

    const rootCategories = await this.prisma.category.findMany({
      where,
      include: {
        children: {
          where: onlyActive ? { isActive: true } : {},
          include: {
            children: {
              where: onlyActive ? { isActive: true } : {},
              include: {
                _count: {
                  select: { products: true },
                },
              },
              orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
            },
            _count: {
              select: { products: true },
            },
          },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    return rootCategories.map((category) => new CategoryTreeDto(category));
  }

  async findOne(id: string): Promise<CategoryDto> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          where: { isActive: true },
          include: {
            _count: {
              select: { products: true },
            },
          },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return new CategoryDto(category);
  }

  async findBySlug(slug: string): Promise<CategoryDto> {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: {
          where: { isActive: true },
          include: {
            _count: {
              select: { products: true },
            },
          },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return new CategoryDto(category);
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryDto> {
    // Check if category exists
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check if new slug already exists (if slug is being updated)
    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const existingCategory = await this.prisma.category.findUnique({
        where: { slug: updateCategoryDto.slug },
      });

      if (existingCategory) {
        throw new ConflictException('Category with this slug already exists');
      }
    }

    // Validate parent category if provided
    if (updateCategoryDto.parentId !== undefined) {
      if (updateCategoryDto.parentId === id) {
        throw new ConflictException('Category cannot be its own parent');
      }

      if (updateCategoryDto.parentId) {
        const parentExists = await this.prisma.category.findUnique({
          where: { id: updateCategoryDto.parentId },
        });

        if (!parentExists) {
          throw new NotFoundException('Parent category not found');
        }

        // Check for circular reference
        if (await this.checkCircularReference(id, updateCategoryDto.parentId)) {
          throw new ConflictException('This would create a circular reference');
        }
      }
    }

    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
      include: {
        parent: true,
        _count: {
          select: { products: true },
        },
      },
    });

    return new CategoryDto(updatedCategory);
  }

  async remove(id: string): Promise<void> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        products: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.children.length > 0) {
      throw new ConflictException('Cannot delete category with subcategories');
    }

    if (category.products.length > 0) {
      throw new ConflictException('Cannot delete category with products');
    }

    await this.prisma.category.delete({
      where: { id },
    });
  }

  private async checkCircularReference(
    categoryId: string,
    parentId: string,
  ): Promise<boolean> {
    let currentParentId: string | null = parentId;

    while (currentParentId) {
      if (currentParentId === categoryId) {
        return true;
      }

      const parent = (await this.prisma.category.findUnique({
        where: { id: currentParentId },
        select: { parentId: true },
      })) as { parentId: string | null } | null;

      currentParentId = parent?.parentId ?? null;
    }

    return false;
  }

  async getBreadcrumbs(categoryId: string): Promise<CategoryDto[]> {
    const breadcrumbs: CategoryDto[] = [];
    let currentId: string | null = categoryId;

    while (currentId) {
      const category = (await this.prisma.category.findUnique({
        where: { id: currentId },
        include: {
          _count: {
            select: { products: true },
          },
        },
      })) as {
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        slug: string;
        sortOrder: number;
        parentId: string | null;
        _count: { products: number };
      } | null;

      if (!category) break;

      breadcrumbs.unshift(new CategoryDto(category));
      currentId = category.parentId;
    }

    return breadcrumbs;
  }
}
