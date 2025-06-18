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

@ApiTags('product-vehicles')
@Controller('products/:productId/vehicles')
export class ProductVehiclesController {
  constructor(
    private readonly productVehiclesService: ProductVehiclesService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Добавить связь товара с автомобилем' })
  @ApiResponse({ status: 201, type: ProductVehicleDto })
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Массовое обновление связей товара с автомобилями' })
  @ApiResponse({ status: 201, type: [ProductVehicleDto] })
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить связь товара с автомобилем' })
  @ApiResponse({ status: 200, type: ProductVehicleDto })
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить связь товара с автомобилем' })
  @ApiResponse({ status: 204 })
  remove(
    @Param('productId') productId: string,
    @Param('vehicleId') vehicleId: string,
  ): Promise<void> {
    return this.productVehiclesService.remove(productId, vehicleId);
  }
}
