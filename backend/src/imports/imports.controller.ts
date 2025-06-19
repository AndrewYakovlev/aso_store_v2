import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ImportsService } from './imports.service';
import { ImportResultDto, ImportPreviewDto } from './dto/import-result.dto';
import { ImportOptionsDto } from './dto/import-options.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { multerConfig } from './multer.config';

@ApiTags('Импорт данных')
@Controller('imports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Post('products/preview')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @ApiOperation({ 
    summary: 'Предварительный просмотр импорта товаров',
    description: 'Анализирует Excel файл и показывает предварительный результат импорта с автоматическим сопоставлением категорий и брендов'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Excel файл с товарами',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Excel файл (.xlsx)'
        }
      }
    }
  })
  async previewProductsImport(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ImportPreviewDto> {
    if (!file) {
      throw new BadRequestException('Файл не загружен');
    }
    return this.importsService.previewImport(file.buffer);
  }

  @Post('products')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @ApiOperation({ 
    summary: 'Импорт товаров из Excel файла',
    description: 'Импортирует товары из Excel файла с автоматическим сопоставлением категорий и брендов'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Excel файл с товарами и опции импорта',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Excel файл (.xlsx)'
        },
        options: {
          type: 'string',
          description: 'JSON строка с опциями импорта (ImportOptionsDto)'
        }
      }
    }
  })
  async importProducts(
    @UploadedFile() file: Express.Multer.File,
    @Body('options') optionsJson?: string,
  ): Promise<ImportResultDto> {
    if (!file) {
      throw new BadRequestException('Файл не загружен');
    }
    let options: ImportOptionsDto = {};
    
    if (optionsJson) {
      try {
        options = JSON.parse(optionsJson);
      } catch (error) {
        options = {};
      }
    }

    return this.importsService.importProducts(file.buffer, options);
  }
}