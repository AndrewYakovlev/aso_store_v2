import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ProductVehiclesService } from './product-vehicles.service';
import {
  CreateProductVehicleDto,
  UpdateProductVehicleDto,
  ProductVehicleDto,
  BulkCreateProductVehicleDto,
} from './dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('product-vehicles')
@Controller('products/:productId/vehicles')
export class ProductVehiclesController {
  constructor(
    private readonly productVehiclesService: ProductVehiclesService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Добавить связь товара с автомобилем (Admin/Manager only)' })
  @ApiResponse({ status: 201, type: ProductVehicleDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(
    @Param('productId') productId: string,
    @Body() createProductVehicleDto: CreateProductVehicleDto,
  ): Promise<ProductVehicleDto> {
    return this.productVehiclesService.create(
      productId,
      createProductVehicleDto,
    );
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Массовое обновление связей товара с автомобилями (Admin/Manager only)' })
  @ApiResponse({ status: 201, type: [ProductVehicleDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  bulkCreate(
    @Param('productId') productId: string,
    @Body() bulkCreateProductVehicleDto: BulkCreateProductVehicleDto,
  ): Promise<ProductVehicleDto[]> {
    return this.productVehiclesService.bulkCreate(
      productId,
      bulkCreateProductVehicleDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Получить все автомобили для товара' })
  @ApiResponse({ status: 200, type: [ProductVehicleDto] })
  findAll(@Param('productId') productId: string): Promise<ProductVehicleDto[]> {
    return this.productVehiclesService.findByProduct(productId);
  }

  @Patch(':vehicleId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить связь товара с автомобилем (Admin/Manager only)' })
  @ApiResponse({ status: 200, type: ProductVehicleDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  update(
    @Param('productId') productId: string,
    @Param('vehicleId') vehicleId: string,
    @Body() updateProductVehicleDto: UpdateProductVehicleDto,
  ): Promise<ProductVehicleDto> {
    return this.productVehiclesService.update(
      productId,
      vehicleId,
      updateProductVehicleDto,
    );
  }

  @Delete(':vehicleId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить связь товара с автомобилем (Admin/Manager only)' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  remove(
    @Param('productId') productId: string,
    @Param('vehicleId') vehicleId: string,
  ): Promise<void> {
    return this.productVehiclesService.remove(productId, vehicleId);
  }
}
