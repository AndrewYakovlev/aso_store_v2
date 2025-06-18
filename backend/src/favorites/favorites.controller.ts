import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { AddFavoriteDto, FavoriteDto } from './dto';
import { OptionalAuthGuard } from '../auth/guards';
import { Request } from 'express';

@ApiTags('favorites')
@Controller('favorites')
@UseGuards(OptionalAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'Get user favorites' })
  @ApiResponse({
    status: 200,
    description: 'List of favorite products',
    type: [FavoriteDto],
  })
  @ApiBearerAuth()
  async getFavorites(@Req() req: Request): Promise<FavoriteDto[]> {
    const user = req.user as any;
    const userId = user?.type === 'user' ? user.id : undefined;
    const anonymousUserId = user?.type === 'anonymous' ? user.id : undefined;
    return this.favoritesService.getFavorites(userId, anonymousUserId);
  }

  @Get('ids')
  @ApiOperation({ summary: 'Get favorite product IDs' })
  @ApiResponse({
    status: 200,
    description: 'List of favorite product IDs',
    type: [String],
  })
  @ApiBearerAuth()
  async getFavoriteIds(@Req() req: Request): Promise<string[]> {
    const user = req.user as any;
    const userId = user?.type === 'user' ? user.id : undefined;
    const anonymousUserId = user?.type === 'anonymous' ? user.id : undefined;
    return this.favoritesService.getFavoriteIds(userId, anonymousUserId);
  }

  @Post()
  @ApiOperation({ summary: 'Add product to favorites' })
  @ApiResponse({
    status: 201,
    description: 'Product added to favorites',
    type: FavoriteDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 409, description: 'Product already in favorites' })
  @ApiBearerAuth()
  async addToFavorites(
    @Req() req: Request,
    @Body() addFavoriteDto: AddFavoriteDto,
  ): Promise<FavoriteDto> {
    const user = req.user as any;
    const userId = user?.type === 'user' ? user.id : undefined;
    const anonymousUserId = user?.type === 'anonymous' ? user.id : undefined;
    return this.favoritesService.addToFavorites(
      userId,
      anonymousUserId,
      addFavoriteDto,
    );
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove product from favorites' })
  @ApiResponse({ status: 204, description: 'Product removed from favorites' })
  @ApiResponse({ status: 404, description: 'Product not in favorites' })
  @ApiBearerAuth()
  async removeFromFavorites(
    @Req() req: Request,
    @Param('productId') productId: string,
  ): Promise<void> {
    const user = req.user as any;
    const userId = user?.type === 'user' ? user.id : undefined;
    const anonymousUserId = user?.type === 'anonymous' ? user.id : undefined;
    return this.favoritesService.removeFromFavorites(
      userId,
      anonymousUserId,
      productId,
    );
  }

  @Get('check/:productId')
  @ApiOperation({ summary: 'Check if product is in favorites' })
  @ApiResponse({
    status: 200,
    description: 'Returns true if product is in favorites',
    type: Boolean,
  })
  @ApiBearerAuth()
  async isFavorite(
    @Req() req: Request,
    @Param('productId') productId: string,
  ): Promise<boolean> {
    const user = req.user as any;
    const userId = user?.type === 'user' ? user.id : undefined;
    const anonymousUserId = user?.type === 'anonymous' ? user.id : undefined;
    return this.favoritesService.isFavorite(userId, anonymousUserId, productId);
  }
}
