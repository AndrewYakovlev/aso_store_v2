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
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
}
