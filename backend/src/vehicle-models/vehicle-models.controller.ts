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
} from '@nestjs/common';
import { VehicleModelsService } from './vehicle-models.service';
import {
  CreateVehicleModelDto,
  UpdateVehicleModelDto,
  VehicleModelDto,
  VehicleModelsFilterDto,
  PaginatedVehicleModelsDto,
} from './dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('vehicle-models')
@Controller('vehicle-models')
export class VehicleModelsController {
  constructor(private readonly vehicleModelsService: VehicleModelsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать новую модель автомобиля' })
  @ApiResponse({ status: 201, type: VehicleModelDto })
  create(@Body() createVehicleModelDto: CreateVehicleModelDto): Promise<VehicleModelDto> {
    return this.vehicleModelsService.create(createVehicleModelDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список моделей автомобилей' })
  @ApiResponse({ status: 200, type: PaginatedVehicleModelsDto })
  findAll(@Query() filter: VehicleModelsFilterDto): Promise<PaginatedVehicleModelsDto> {
    return this.vehicleModelsService.findAll(filter);
  }

  @Get('classes')
  @ApiOperation({ summary: 'Получить список доступных классов автомобилей' })
  @ApiResponse({ status: 200, type: [String] })
  getAvailableClasses(): Promise<string[]> {
    return this.vehicleModelsService.getAvailableClasses();
  }

  @Get('by-brand/:brandSlug')
  @ApiOperation({ summary: 'Получить модели по slug марки' })
  @ApiResponse({ status: 200, type: [VehicleModelDto] })
  findByBrand(@Param('brandSlug') brandSlug: string): Promise<VehicleModelDto[]> {
    return this.vehicleModelsService.findByBrand(brandSlug);
  }

  @Get('by-slug/:slug')
  @ApiOperation({ summary: 'Получить модель по slug' })
  @ApiResponse({ status: 200, type: VehicleModelDto })
  findBySlug(@Param('slug') slug: string): Promise<VehicleModelDto> {
    return this.vehicleModelsService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить модель по ID' })
  @ApiResponse({ status: 200, type: VehicleModelDto })
  findOne(@Param('id') id: string): Promise<VehicleModelDto> {
    return this.vehicleModelsService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить модель автомобиля' })
  @ApiResponse({ status: 200, type: VehicleModelDto })
  update(
    @Param('id') id: string,
    @Body() updateVehicleModelDto: UpdateVehicleModelDto,
  ): Promise<VehicleModelDto> {
    return this.vehicleModelsService.update(id, updateVehicleModelDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить модель автомобиля' })
  @ApiResponse({ status: 204 })
  remove(@Param('id') id: string): Promise<void> {
    return this.vehicleModelsService.remove(id);
  }
}