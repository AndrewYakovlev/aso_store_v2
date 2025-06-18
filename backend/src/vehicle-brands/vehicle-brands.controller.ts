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
import { VehicleBrandsService } from './vehicle-brands.service';
import {
  CreateVehicleBrandDto,
  UpdateVehicleBrandDto,
  VehicleBrandDto,
  VehicleBrandWithCountDto,
  VehicleBrandsFilterDto,
  PaginatedVehicleBrandsDto,
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

@ApiTags('vehicle-brands')
@Controller('vehicle-brands')
export class VehicleBrandsController {
  constructor(private readonly vehicleBrandsService: VehicleBrandsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать новую марку автомобиля (Admin only)' })
  @ApiResponse({ status: 201, type: VehicleBrandDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(
    @Body() createVehicleBrandDto: CreateVehicleBrandDto,
  ): Promise<VehicleBrandDto> {
    return this.vehicleBrandsService.create(createVehicleBrandDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список марок автомобилей' })
  @ApiResponse({ status: 200, type: PaginatedVehicleBrandsDto })
  findAll(
    @Query() filter: VehicleBrandsFilterDto,
  ): Promise<PaginatedVehicleBrandsDto> {
    return this.vehicleBrandsService.findAll(filter);
  }

  @Get('countries')
  @ApiOperation({ summary: 'Получить список стран производителей' })
  @ApiResponse({ status: 200, type: [String] })
  findAllCountries(): Promise<string[]> {
    return this.vehicleBrandsService.findAllCountries();
  }

  @Get('popular')
  @ApiOperation({ summary: 'Получить популярные марки' })
  @ApiResponse({ status: 200, type: [VehicleBrandWithCountDto] })
  findPopular(
    @Query('limit') limit?: number,
  ): Promise<VehicleBrandWithCountDto[]> {
    return this.vehicleBrandsService.findPopular(limit);
  }

  @Get('by-slug/:slug')
  @ApiOperation({ summary: 'Получить марку по slug' })
  @ApiResponse({ status: 200, type: VehicleBrandDto })
  findBySlug(@Param('slug') slug: string): Promise<VehicleBrandDto> {
    return this.vehicleBrandsService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить марку по ID' })
  @ApiResponse({ status: 200, type: VehicleBrandDto })
  findOne(@Param('id') id: string): Promise<VehicleBrandDto> {
    return this.vehicleBrandsService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить марку автомобиля (Admin only)' })
  @ApiResponse({ status: 200, type: VehicleBrandDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  update(
    @Param('id') id: string,
    @Body() updateVehicleBrandDto: UpdateVehicleBrandDto,
  ): Promise<VehicleBrandDto> {
    return this.vehicleBrandsService.update(id, updateVehicleBrandDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить марку автомобиля (Admin only)' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  remove(@Param('id') id: string): Promise<void> {
    return this.vehicleBrandsService.remove(id);
  }
}
