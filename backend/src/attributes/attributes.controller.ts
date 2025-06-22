import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AttributesService } from './attributes.service';
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('attributes')
@Controller('attributes')
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать новый атрибут (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Атрибут успешно создан',
    type: AttributeDto,
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(
    @Body() createAttributeDto: CreateAttributeDto,
  ): Promise<AttributeDto> {
    return this.attributesService.create(createAttributeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список всех атрибутов' })
  @ApiResponse({
    status: 200,
    description: 'Список атрибутов',
    type: [AttributeDto],
  })
  findAll(): Promise<AttributeDto[]> {
    return this.attributesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить атрибут по ID' })
  @ApiParam({ name: 'id', description: 'ID атрибута' })
  @ApiResponse({
    status: 200,
    description: 'Атрибут найден',
    type: AttributeDto,
  })
  @ApiResponse({ status: 404, description: 'Атрибут не найден' })
  findOne(@Param('id') id: string): Promise<AttributeDto> {
    return this.attributesService.findOne(id);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Получить атрибут по коду' })
  @ApiParam({ name: 'code', description: 'Код атрибута' })
  @ApiResponse({
    status: 200,
    description: 'Атрибут найден',
    type: AttributeDto,
  })
  @ApiResponse({ status: 404, description: 'Атрибут не найден' })
  findByCode(@Param('code') code: string): Promise<AttributeDto> {
    return this.attributesService.findByCode(code);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить атрибут (Admin only)' })
  @ApiParam({ name: 'id', description: 'ID атрибута' })
  @ApiResponse({
    status: 200,
    description: 'Атрибут успешно обновлен',
    type: AttributeDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Атрибут не найден' })
  update(
    @Param('id') id: string,
    @Body() updateAttributeDto: UpdateAttributeDto,
  ): Promise<AttributeDto> {
    return this.attributesService.update(id, updateAttributeDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить атрибут (Admin only)' })
  @ApiParam({ name: 'id', description: 'ID атрибута' })
  @ApiResponse({ status: 204, description: 'Атрибут успешно удален' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Атрибут не найден' })
  remove(@Param('id') id: string): Promise<void> {
    return this.attributesService.remove(id);
  }

  // Category attributes endpoints
  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Получить атрибуты категории' })
  @ApiParam({ name: 'categoryId', description: 'ID категории' })
  @ApiResponse({
    status: 200,
    description: 'Список атрибутов категории',
    type: [CategoryAttributeDto],
  })
  getCategoryAttributes(
    @Param('categoryId') categoryId: string,
  ): Promise<CategoryAttributeDto[]> {
    return this.attributesService.getCategoryAttributes(categoryId);
  }

  @Post('category/:categoryId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Привязать атрибуты к категории (Admin only)' })
  @ApiParam({ name: 'categoryId', description: 'ID категории' })
  @ApiResponse({
    status: 200,
    description: 'Атрибуты успешно привязаны',
    type: [CategoryAttributeDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Категория не найдена' })
  assignAttributesToCategory(
    @Param('categoryId') categoryId: string,
    @Body() dto: AssignAttributesToCategoryDto,
  ): Promise<CategoryAttributeDto[]> {
    return this.attributesService.assignAttributesToCategory(categoryId, dto);
  }

  @Delete('category/:categoryId/:attributeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Отвязать атрибут от категории (Admin only)' })
  @ApiParam({ name: 'categoryId', description: 'ID категории' })
  @ApiParam({ name: 'attributeId', description: 'ID атрибута' })
  @ApiResponse({ status: 204, description: 'Атрибут успешно отвязан' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Связь не найдена' })
  removeAttributeFromCategory(
    @Param('categoryId') categoryId: string,
    @Param('attributeId') attributeId: string,
  ): Promise<void> {
    return this.attributesService.removeAttributeFromCategory(
      categoryId,
      attributeId,
    );
  }

  // Product attributes endpoints
  @Get('product/:productId')
  @ApiOperation({ summary: 'Получить атрибуты товара' })
  @ApiParam({ name: 'productId', description: 'ID товара' })
  @ApiResponse({
    status: 200,
    description: 'Список атрибутов товара',
    type: [ProductAttributeValueDto],
  })
  getProductAttributes(
    @Param('productId') productId: string,
  ): Promise<ProductAttributeValueDto[]> {
    return this.attributesService.getProductAttributes(productId);
  }

  @Post('product/:productId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Установить значение атрибута товара (Admin/Manager only)',
  })
  @ApiParam({ name: 'productId', description: 'ID товара' })
  @ApiResponse({
    status: 200,
    description: 'Значение атрибута установлено',
    type: ProductAttributeValueDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Товар или атрибут не найден' })
  setProductAttribute(
    @Param('productId') productId: string,
    @Body() dto: SetProductAttributeDto,
  ): Promise<ProductAttributeValueDto> {
    return this.attributesService.setProductAttribute(productId, dto);
  }

  @Post('product/:productId/bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Установить значения нескольких атрибутов товара (Admin/Manager only)',
  })
  @ApiParam({ name: 'productId', description: 'ID товара' })
  @ApiResponse({
    status: 200,
    description: 'Значения атрибутов установлены',
    type: [ProductAttributeValueDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Товар или атрибут не найден' })
  setProductAttributes(
    @Param('productId') productId: string,
    @Body() dto: BulkSetProductAttributesDto,
  ): Promise<ProductAttributeValueDto[]> {
    return this.attributesService.setProductAttributes(productId, dto);
  }

  @Delete('product/:productId/:attributeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Удалить значение атрибута товара (Admin/Manager only)',
  })
  @ApiParam({ name: 'productId', description: 'ID товара' })
  @ApiParam({ name: 'attributeId', description: 'ID атрибута' })
  @ApiResponse({ status: 204, description: 'Значение атрибута удалено' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Значение не найдено' })
  removeProductAttribute(
    @Param('productId') productId: string,
    @Param('attributeId') attributeId: string,
  ): Promise<void> {
    return this.attributesService.removeProductAttribute(
      productId,
      attributeId,
    );
  }
}
