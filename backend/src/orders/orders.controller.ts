import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  OrderDto,
  OrdersFilterDto,
  PaginatedOrdersDto,
  OrderStatusDto,
  DeliveryMethodDto,
  PaymentMethodDto,
} from './dto';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('statuses')
  @ApiOperation({ summary: 'Получить список статусов заказов' })
  @ApiResponse({
    status: 200,
    description: 'Список статусов заказов',
    type: [OrderStatusDto],
  })
  async getOrderStatuses(): Promise<OrderStatusDto[]> {
    return this.ordersService.getOrderStatuses();
  }

  @Get('delivery-methods')
  @ApiOperation({ summary: 'Получить список методов доставки' })
  @ApiResponse({
    status: 200,
    description: 'Список методов доставки',
    type: [DeliveryMethodDto],
  })
  async getDeliveryMethods(): Promise<DeliveryMethodDto[]> {
    return this.ordersService.getDeliveryMethods();
  }

  @Get('payment-methods')
  @ApiOperation({ summary: 'Получить список методов оплаты' })
  @ApiResponse({
    status: 200,
    description: 'Список методов оплаты',
    type: [PaymentMethodDto],
  })
  async getPaymentMethods(): Promise<PaymentMethodDto[]> {
    return this.ordersService.getPaymentMethods();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создать новый заказ' })
  @ApiResponse({
    status: 201,
    description: 'Заказ успешно создан',
    type: OrderDto,
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 401, description: 'Требуется авторизация' })
  @ApiBearerAuth()
  async create(
    @Request() req,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<OrderDto> {
    const user = req.user as any;
    console.log('Order create - user from request:', user);
    const userId = user?.id || user?.sub;
    console.log('Order create - userId:', userId);
    
    return this.ordersService.create(
      userId,
      undefined, // Orders are only for authenticated users now
      createOrderDto,
    );
  }

  @Get()
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'Получить список заказов текущего пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Список заказов',
    type: PaginatedOrdersDto,
  })
  @ApiBearerAuth()
  async findAll(
    @Request() req,
    @Query() filter: OrdersFilterDto,
  ): Promise<PaginatedOrdersDto> {
    const user = req.user as any;
    const userId = user?.type === 'user' ? user.id : undefined;
    const anonymousUserId = user?.type === 'anonymous' ? user.id : undefined;
    
    return this.ordersService.findAll(
      userId,
      anonymousUserId,
      filter,
    );
  }

  @Get('by-number/:orderNumber')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'Получить заказ по номеру' })
  @ApiParam({ name: 'orderNumber', description: 'Номер заказа' })
  @ApiResponse({
    status: 200,
    description: 'Заказ',
    type: OrderDto,
  })
  @ApiResponse({ status: 404, description: 'Заказ не найден' })
  @ApiBearerAuth()
  async findByOrderNumber(
    @Request() req,
    @Param('orderNumber') orderNumber: string,
  ): Promise<OrderDto> {
    const user = req.user as any;
    const userId = user?.type === 'user' ? user.id : undefined;
    const anonymousUserId = user?.type === 'anonymous' ? user.id : undefined;
    
    return this.ordersService.findByOrderNumber(
      orderNumber,
      userId,
      anonymousUserId,
    );
  }

  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'Получить заказ по ID' })
  @ApiParam({ name: 'id', description: 'ID заказа' })
  @ApiResponse({
    status: 200,
    description: 'Заказ',
    type: OrderDto,
  })
  @ApiResponse({ status: 404, description: 'Заказ не найден' })
  @ApiBearerAuth()
  async findOne(
    @Request() req,
    @Param('id') id: string,
  ): Promise<OrderDto> {
    const user = req.user as any;
    const userId = user?.type === 'user' ? user.id : undefined;
    const anonymousUserId = user?.type === 'anonymous' ? user.id : undefined;
    
    return this.ordersService.findOne(
      id,
      userId,
      anonymousUserId,
    );
  }

  // Admin endpoint - should be protected with admin guard in production
  @Put(':id/status')
  @ApiOperation({ summary: 'Обновить статус заказа (для администраторов)' })
  @ApiParam({ name: 'id', description: 'ID заказа' })
  @ApiResponse({
    status: 200,
    description: 'Статус заказа обновлен',
    type: OrderDto,
  })
  @ApiResponse({ status: 404, description: 'Заказ не найден' })
  @ApiResponse({ status: 400, description: 'Некорректный статус' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ): Promise<OrderDto> {
    return this.ordersService.updateStatus(id, updateStatusDto);
  }
}