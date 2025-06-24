import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { BrandsService } from './brands.service';
import {
  CreateBrandDto,
  UpdateBrandDto,
  BrandDto,
  BrandsFilterDto,
  PaginatedBrandsDto,
} from './dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

@ApiTags('brands')
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать новый бренд' })
  @ApiResponse({ status: 201, type: BrandDto })
  create(@Body() createBrandDto: CreateBrandDto): Promise<BrandDto> {
    return this.brandsService.create(createBrandDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список брендов' })
  @ApiResponse({ status: 200, type: PaginatedBrandsDto })
  findAll(@Query() filter: BrandsFilterDto): Promise<PaginatedBrandsDto> {
    return this.brandsService.findAll(filter);
  }

  @Get('by-slug/:slug')
  @ApiOperation({ summary: 'Получить бренд по slug' })
  @ApiResponse({ status: 200, type: BrandDto })
  findBySlug(@Param('slug') slug: string): Promise<BrandDto> {
    return this.brandsService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить бренд по ID' })
  @ApiResponse({ status: 200, type: BrandDto })
  findOne(@Param('id') id: string): Promise<BrandDto> {
    return this.brandsService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить бренд' })
  @ApiResponse({ status: 200, type: BrandDto })
  update(
    @Param('id') id: string,
    @Body() updateBrandDto: UpdateBrandDto,
  ): Promise<BrandDto> {
    return this.brandsService.update(id, updateBrandDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить бренд' })
  @ApiResponse({ status: 204 })
  remove(@Param('id') id: string): Promise<void> {
    return this.brandsService.remove(id);
  }

  @Post(':id/logo/upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Загрузить логотип бренда' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, type: BrandDto })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads/brands';
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `brand-${Date.now()}-${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Недопустимый формат файла. Разрешены только JPEG, PNG, GIF, WebP'), false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadLogo(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<BrandDto> {
    if (!file) {
      throw new BadRequestException('Файл не был загружен');
    }

    const logoUrl = `/uploads/brands/${file.filename}`;
    return this.brandsService.update(id, { logo: logoUrl });
  }
}
