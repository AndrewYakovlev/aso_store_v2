import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  ParseFilePipeBuilder,
  HttpStatus,
  UseGuards,
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

@ApiTags('Импорт данных')
@Controller('imports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Post('products/preview')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseInterceptors(FileInterceptor('file'))
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
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(xlsx|xls)$/,
        })
        .addMaxSizeValidator({
          maxSize: 10 * 1024 * 1024, // 10MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ): Promise<ImportPreviewDto> {
    return this.importsService.previewImport(file.buffer);
  }

  @Post('products')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseInterceptors(FileInterceptor('file'))
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
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(xlsx|xls)$/,
        })
        .addMaxSizeValidator({
          maxSize: 10 * 1024 * 1024, // 10MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @Body('options') optionsJson?: string,
  ): Promise<ImportResultDto> {
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