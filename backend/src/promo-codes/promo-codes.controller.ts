import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PromoCodesService } from './promo-codes.service';
import { PromoCodeTriggersService } from './promo-code-triggers.service';
import { PromoCodeValidationService } from './promo-code-validation.service';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';
import { PromoCodeDto } from './dto/promo-code.dto';
import { PromoCodeUsageDto } from './dto/promo-code-usage.dto';
import { PromoCodeTriggerDto } from './dto/promo-code-trigger.dto';
import { UpdatePromoCodeTriggerDto } from './dto/update-promo-code-trigger.dto';
import {
  ValidatePromoCodeDto,
  ValidatePromoCodeResponseDto,
} from './dto/validate-promo-code.dto';
import { PaginatedPromoCodesDto } from './dto/paginated-promo-codes.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtGuard } from '../auth/guards/optional-jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { CartService } from '../cart/cart.service';

@ApiTags('promo-codes')
@Controller('promo-codes')
export class PromoCodesController {
  constructor(
    private readonly promoCodesService: PromoCodesService,
    private readonly triggersService: PromoCodeTriggersService,
    private readonly validationService: PromoCodeValidationService,
    private readonly cartService: CartService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create promo code' })
  @ApiResponse({ status: 201, type: PromoCodeDto })
  create(@Body() createPromoCodeDto: CreatePromoCodeDto) {
    return this.promoCodesService.create(createPromoCodeDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all promo codes' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'isPublic', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, type: PaginatedPromoCodesDto })
  findAll(
    @Query('isActive') isActive?: string,
    @Query('isPublic') isPublic?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.promoCodesService.findAll({
      isActive:
        isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      isPublic:
        isPublic === 'true' ? true : isPublic === 'false' ? false : undefined,
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get('triggers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all promo code triggers' })
  @ApiResponse({ status: 200, type: [PromoCodeTriggerDto] })
  getTriggers() {
    return this.triggersService.getActiveTriggers();
  }

  @Get('triggers/:type')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get promo code trigger by type' })
  @ApiResponse({ status: 200, type: PromoCodeTriggerDto })
  getTrigger(@Param('type') type: string) {
    return this.triggersService.getTriggerByType(type);
  }

  @Patch('triggers/:type')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update promo code trigger' })
  @ApiResponse({ status: 200, type: PromoCodeTriggerDto })
  updateTrigger(
    @Param('type') type: string,
    @Body() updateTriggerDto: UpdatePromoCodeTriggerDto,
  ) {
    return this.triggersService.updateTrigger(type, updateTriggerDto);
  }

  @Post('validate')
  @UseGuards(OptionalJwtGuard)
  @ApiOperation({ summary: 'Validate promo code' })
  @ApiResponse({ status: 200, type: ValidatePromoCodeResponseDto })
  async validate(
    @Body() validateDto: ValidatePromoCodeDto,
    @Req() req: RequestWithUser,
  ): Promise<ValidatePromoCodeResponseDto> {
    const userId = req.user?.id || undefined;

    // Get cart items
    const cart = await this.cartService.getCart(
      userId,
      req.anonymousUserId || undefined,
    );

    // Convert cart items to validation format
    const itemsForValidation = cart.items.map((item) => ({
      productId: item.productId,
      offerId: item.offerId,
      quantity: item.quantity,
      product: item.product
        ? {
            price: { toNumber: () => item.product!.price } as any,
            excludeFromPromoCodes: item.product.excludeFromPromoCodes,
          }
        : undefined,
      offer: item.offer
        ? {
            price: { toNumber: () => item.offer!.price } as any,
          }
        : undefined,
    }));

    const result = await this.validationService.validatePromoCode(
      validateDto.code,
      userId || null,
      itemsForValidation,
    );

    if (result.isValid) {
      const promoCode = await this.promoCodesService.findByCode(
        validateDto.code,
      );

      return {
        ...result,
        discountType: promoCode?.discountType,
        discountValue: promoCode?.discountValue,
      };
    }

    return result;
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my available promo codes' })
  @ApiResponse({ status: 200, type: [PromoCodeDto] })
  getMyPromoCodes(@Req() req: RequestWithUser) {
    if (!req.user) {
      throw new UnauthorizedException();
    }
    return this.promoCodesService.getUserPromoCodes(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get promo code by id' })
  @ApiResponse({ status: 200, type: PromoCodeDto })
  findOne(@Param('id') id: string) {
    return this.promoCodesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update promo code' })
  @ApiResponse({ status: 200, type: PromoCodeDto })
  update(
    @Param('id') id: string,
    @Body() updatePromoCodeDto: UpdatePromoCodeDto,
  ) {
    return this.promoCodesService.update(id, updatePromoCodeDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete promo code' })
  @ApiResponse({ status: 204 })
  remove(@Param('id') id: string) {
    return this.promoCodesService.delete(id);
  }

  @Get('usage/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all promo codes usage history' })
  @ApiQuery({ name: 'promoCodeId', required: false, type: String })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'orderId', required: false, type: String })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, type: [PromoCodeUsageDto] })
  getAllUsageHistory(
    @Query('promoCodeId') promoCodeId?: string,
    @Query('userId') userId?: string,
    @Query('orderId') orderId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.promoCodesService.getAllUsageHistory({
      promoCodeId,
      userId,
      orderId,
      dateFrom,
      dateTo,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get(':id/usage')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get promo code usage statistics' })
  @ApiResponse({ status: 200, type: [PromoCodeUsageDto] })
  getUsageStatistics(@Param('id') id: string) {
    return this.promoCodesService.getUsageStatistics(id);
  }

  @Post(':id/assign/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign promo code to user' })
  @ApiResponse({ status: 204 })
  assignToUser(@Param('id') id: string, @Param('userId') userId: string) {
    return this.promoCodesService.assignToUser(id, userId);
  }
}
