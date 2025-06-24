import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateProductImageDto,
  UpdateProductImageDto,
  ProductImageDto,
} from './dto/product-image.dto';

@Injectable()
export class ProductImagesService {
  constructor(private prisma: PrismaService) {}

  async create(
    productId: string,
    createProductImageDto: CreateProductImageDto,
  ): Promise<ProductImageDto> {
    // Проверяем существование товара
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Если это главное изображение, сбрасываем isMain у других
    if (createProductImageDto.isMain) {
      await this.prisma.productImage.updateMany({
        where: { productId, isMain: true },
        data: { isMain: false },
      });
    }

    // Получаем максимальный sortOrder
    const maxOrder = await this.prisma.productImage.findFirst({
      where: { productId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    const sortOrder = createProductImageDto.sortOrder ?? 
      ((maxOrder?.sortOrder ?? -1) + 1);

    const image = await this.prisma.productImage.create({
      data: {
        productId,
        url: createProductImageDto.url,
        alt: createProductImageDto.alt ?? null,
        sortOrder,
        isMain: createProductImageDto.isMain ?? false,
      },
    });

    return image;
  }

  async findAll(productId: string): Promise<ProductImageDto[]> {
    const images = await this.prisma.productImage.findMany({
      where: { productId },
      orderBy: [{ isMain: 'desc' }, { sortOrder: 'asc' }],
    });

    return images;
  }

  async update(
    productId: string,
    id: string,
    updateProductImageDto: UpdateProductImageDto,
  ): Promise<ProductImageDto> {
    const image = await this.prisma.productImage.findFirst({
      where: { id, productId },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    // Если устанавливаем главное изображение
    if (updateProductImageDto.isMain === true) {
      await this.prisma.productImage.updateMany({
        where: { productId, isMain: true, NOT: { id } },
        data: { isMain: false },
      });
    }

    const updated = await this.prisma.productImage.update({
      where: { id },
      data: {
        ...updateProductImageDto,
        alt: updateProductImageDto.alt !== undefined ? (updateProductImageDto.alt ?? null) : undefined,
      },
    });

    return updated;
  }

  async remove(productId: string, id: string): Promise<void> {
    const image = await this.prisma.productImage.findFirst({
      where: { id, productId },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    await this.prisma.productImage.delete({
      where: { id },
    });

    // TODO: Удалить файл с диска
    // const filePath = path.join(process.cwd(), image.url);
    // if (fs.existsSync(filePath)) {
    //   fs.unlinkSync(filePath);
    // }
  }

  async reorder(productId: string, imageIds: string[]): Promise<void> {
    // Проверяем, что все изображения принадлежат этому товару
    const images = await this.prisma.productImage.findMany({
      where: { id: { in: imageIds }, productId },
      select: { id: true },
    });

    if (images.length !== imageIds.length) {
      throw new NotFoundException('Some images not found or belong to another product');
    }

    // Обновляем порядок
    const updates = imageIds.map((id, index) =>
      this.prisma.productImage.update({
        where: { id },
        data: { sortOrder: index },
      }),
    );

    await this.prisma.$transaction(updates);
  }
}