import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import {
  OverallStatisticsDto,
  PeriodicStatisticsItemDto,
  TopProductDto,
  OrderStatusStatisticsDto,
  PaymentMethodStatisticsDto,
  NewCustomersStatisticsDto,
} from './dto';

@ApiTags('statistics')
@Controller('statistics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
@ApiBearerAuth()
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('overall')
  @ApiOperation({ summary: 'Получить общую статистику' })
  @ApiResponse({
    status: 200,
    description: 'Общая статистика',
    type: OverallStatisticsDto,
  })
  async getOverallStatistics(): Promise<OverallStatisticsDto> {
    return this.statisticsService.getOverallStatistics();
  }

  @Get('periodic')
  @ApiOperation({ summary: 'Получить статистику по периодам' })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['day', 'week', 'month'],
    description: 'Период для статистики',
  })
  @ApiResponse({
    status: 200,
    description: 'Статистика по периодам',
    type: [PeriodicStatisticsItemDto],
  })
  async getPeriodicStatistics(
    @Query('period') period?: 'day' | 'week' | 'month',
  ): Promise<PeriodicStatisticsItemDto[]> {
    return this.statisticsService.getPeriodicStatistics(period);
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Получить топ продаваемых товаров' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Количество товаров',
  })
  @ApiResponse({
    status: 200,
    description: 'Топ товаров',
    type: [TopProductDto],
  })
  async getTopProducts(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): Promise<TopProductDto[]> {
    return this.statisticsService.getTopProducts(limit);
  }

  @Get('order-status')
  @ApiOperation({ summary: 'Получить статистику по статусам заказов' })
  @ApiResponse({
    status: 200,
    description: 'Статистика по статусам',
    type: [OrderStatusStatisticsDto],
  })
  async getOrderStatusStatistics(): Promise<OrderStatusStatisticsDto[]> {
    return this.statisticsService.getOrderStatusStatistics();
  }

  @Get('payment-methods')
  @ApiOperation({ summary: 'Получить статистику по методам оплаты' })
  @ApiResponse({
    status: 200,
    description: 'Статистика по методам оплаты',
    type: [PaymentMethodStatisticsDto],
  })
  async getPaymentMethodStatistics(): Promise<PaymentMethodStatisticsDto[]> {
    return this.statisticsService.getPaymentMethodStatistics();
  }

  @Get('new-customers')
  @ApiOperation({ summary: 'Получить статистику по новым клиентам' })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Количество дней для анализа',
  })
  @ApiResponse({
    status: 200,
    description: 'Статистика по новым клиентам',
    type: NewCustomersStatisticsDto,
  })
  async getNewCustomersStatistics(
    @Query('days', new ParseIntPipe({ optional: true })) days?: number,
  ): Promise<NewCustomersStatisticsDto> {
    return this.statisticsService.getNewCustomersStatistics(days);
  }
}
