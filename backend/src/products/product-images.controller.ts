import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProductImagesService } from './product-images.service';
import {
  CreateProductImageDto,
  UpdateProductImageDto,
  ProductImageDto,
  ReorderProductImagesDto,
} from './dto/product-image.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('product-images')
@Controller('products/:productId/images')
export class ProductImagesController {
  constructor(private readonly productImagesService: ProductImagesService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads/products';
          // Ensure directory exists
          if (!require('fs').existsSync(uploadPath)) {
            require('fs').mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `product-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'image/webp',
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Invalid file type. Only JPEG, PNG, GIF and WebP are allowed',
            ),
            false,
          );
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB для товаров
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload product image' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        alt: {
          type: 'string',
          description: 'Alt text for SEO',
        },
        isMain: {
          type: 'boolean',
          description: 'Set as main image',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    type: ProductImageDto,
  })
  async uploadImage(
    @Param('productId') productId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { alt?: string; isMain?: string | boolean },
  ): Promise<ProductImageDto> {
    console.log('Upload request received for product:', productId);
    console.log('File:', file?.filename);
    
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const url = `/uploads/products/${file.filename}`;
    // Handle isMain as either string (from multipart/form-data) or boolean
    let isMain = false;
    if (typeof body.isMain === 'string') {
      isMain = body.isMain === 'true';
    } else if (typeof body.isMain === 'boolean') {
      isMain = body.isMain;
    }
    
    const createDto: CreateProductImageDto = {
      url,
      alt: body.alt,
      isMain,
    };

    return this.productImagesService.create(productId, createDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add product image by URL' })
  @ApiResponse({
    status: 201,
    description: 'Image added successfully',
    type: ProductImageDto,
  })
  async create(
    @Param('productId') productId: string,
    @Body() createProductImageDto: CreateProductImageDto,
  ): Promise<ProductImageDto> {
    return this.productImagesService.create(productId, createProductImageDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all product images' })
  @ApiResponse({
    status: 200,
    description: 'List of product images',
    type: [ProductImageDto],
  })
  async findAll(
    @Param('productId') productId: string,
  ): Promise<ProductImageDto[]> {
    return this.productImagesService.findAll(productId);
  }

  @Patch('reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reorder product images' })
  @ApiResponse({
    status: 200,
    description: 'Images reordered successfully',
  })
  async reorder(
    @Param('productId') productId: string,
    @Body() reorderDto: ReorderProductImagesDto,
  ): Promise<void> {
    return this.productImagesService.reorder(productId, reorderDto.imageIds);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product image' })
  @ApiResponse({
    status: 200,
    description: 'Image updated successfully',
    type: ProductImageDto,
  })
  async update(
    @Param('productId') productId: string,
    @Param('id') id: string,
    @Body() updateProductImageDto: UpdateProductImageDto,
  ): Promise<ProductImageDto> {
    return this.productImagesService.update(
      productId,
      id,
      updateProductImageDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete product image' })
  @ApiResponse({ status: 204, description: 'Image deleted successfully' })
  async remove(
    @Param('productId') productId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.productImagesService.remove(productId, id);
  }
}