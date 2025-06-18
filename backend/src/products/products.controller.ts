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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductDto,
  ProductsFilterDto,
  PaginatedProductsDto,
} from './dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: ProductDto,
  })
  @ApiResponse({ status: 409, description: 'Product with this SKU or slug already exists' })
  async create(@Body() createProductDto: CreateProductDto): Promise<ProductDto> {
    return this.productsService.create(createProductDto);
  }

  @Get('filters')
  @ApiOperation({ summary: 'Get available filters for products' })
  @ApiResponse({
    status: 200,
    description: 'Available filters with counts',
  })
  async getFilters(@Query() baseFilter: ProductsFilterDto) {
    return this.productsService.getAvailableFilters(baseFilter);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with filters' })
  @ApiResponse({
    status: 200,
    description: 'List of products',
    type: PaginatedProductsDto,
  })
  async findAll(@Query() filter: ProductsFilterDto): Promise<PaginatedProductsDto> {
    return this.productsService.findAll(filter);
  }

  @Get('by-slug/:slug')
  @ApiOperation({ summary: 'Get product by slug' })
  @ApiResponse({
    status: 200,
    description: 'Product found',
    type: ProductDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findBySlug(@Param('slug') slug: string): Promise<ProductDto> {
    return this.productsService.findBySlug(slug);
  }

  @Get('by-category/:categorySlug')
  @ApiOperation({ summary: 'Get products by category slug' })
  @ApiResponse({
    status: 200,
    description: 'List of products in category',
    type: PaginatedProductsDto,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findByCategorySlug(
    @Param('categorySlug') categorySlug: string,
    @Query() filter: ProductsFilterDto,
  ): Promise<PaginatedProductsDto> {
    return this.productsService.findByCategorySlug(categorySlug, filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({
    status: 200,
    description: 'Product found',
    type: ProductDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findById(@Param('id') id: string): Promise<ProductDto> {
    return this.productsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product' })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: ProductDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 409, description: 'Product with this slug already exists' })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductDto> {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete product' })
  @ApiResponse({ status: 204, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.productsService.remove(id);
  }
}