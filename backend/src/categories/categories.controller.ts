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
  ParseBoolPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryDto,
  CategoryTreeDto,
} from './dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category (Admin only)' })
  @ApiResponse({ status: 201, type: CategoryDto })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({
    status: 409,
    description: 'Category with this slug already exists',
  })
  // @UseGuards(JwtAuthGuard, AdminGuard) // TODO: Add admin guard
  // @ApiBearerAuth()
  create(@Body() createCategoryDto: CreateCategoryDto): Promise<CategoryDto> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiQuery({ name: 'onlyActive', required: false, type: Boolean })
  @ApiQuery({ name: 'includeProductCount', required: false, type: Boolean })
  @ApiResponse({ status: 200, type: [CategoryDto] })
  findAll(
    @Query('onlyActive', new ParseBoolPipe({ optional: true }))
    onlyActive?: boolean,
    @Query('includeProductCount', new ParseBoolPipe({ optional: true }))
    includeProductCount?: boolean,
  ): Promise<CategoryDto[]> {
    return this.categoriesService.findAll(
      onlyActive ?? true,
      includeProductCount ?? true,
    );
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get categories tree structure' })
  @ApiQuery({ name: 'onlyActive', required: false, type: Boolean })
  @ApiResponse({ status: 200, type: [CategoryTreeDto] })
  findTree(
    @Query('onlyActive', new ParseBoolPipe({ optional: true }))
    onlyActive?: boolean,
  ): Promise<CategoryTreeDto[]> {
    return this.categoriesService.findTree(onlyActive ?? true);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get category by slug' })
  @ApiResponse({ status: 200, type: CategoryDto })
  @ApiResponse({ status: 404, description: 'Category not found' })
  findBySlug(@Param('slug') slug: string): Promise<CategoryDto> {
    return this.categoriesService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({ status: 200, type: CategoryDto })
  @ApiResponse({ status: 404, description: 'Category not found' })
  findOne(@Param('id') id: string): Promise<CategoryDto> {
    return this.categoriesService.findOne(id);
  }

  @Get(':id/breadcrumbs')
  @ApiOperation({ summary: 'Get category breadcrumbs' })
  @ApiResponse({ status: 200, type: [CategoryDto] })
  getBreadcrumbs(@Param('id') id: string): Promise<CategoryDto[]> {
    return this.categoriesService.getBreadcrumbs(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update category (Admin only)' })
  @ApiResponse({ status: 200, type: CategoryDto })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 409, description: 'Conflict' })
  // @UseGuards(JwtAuthGuard, AdminGuard) // TODO: Add admin guard
  // @ApiBearerAuth()
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryDto> {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete category (Admin only)' })
  @ApiResponse({ status: 204, description: 'Category deleted' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({
    status: 409,
    description: 'Cannot delete category with subcategories or products',
  })
  // @UseGuards(JwtAuthGuard, AdminGuard) // TODO: Add admin guard
  // @ApiBearerAuth()
  remove(@Param('id') id: string): Promise<void> {
    return this.categoriesService.remove(id);
  }
}
