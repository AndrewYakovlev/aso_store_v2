import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import {
  DashboardStatisticsDto,
  PeriodStatisticsDto,
} from './dto/statistics.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('statistics')
@Controller('statistics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('dashboard')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Получить статистику для дашборда' })
  @ApiResponse({
    status: 200,
    description: 'Статистика дашборда',
    type: DashboardStatisticsDto,
  })
  getDashboardStatistics() {
    return this.statisticsService.getDashboardStatistics();
  }

  @Get('revenue')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Получить статистику по выручке' })
  @ApiResponse({ status: 200, description: 'Статистика выручки' })
  getRevenueStatistics(@Query() period: PeriodStatisticsDto) {
    return this.statisticsService.getRevenueStatistics(period);
  }

  @Get('products')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Получить статистику по товарам' })
  @ApiResponse({ status: 200, description: 'Статистика товаров' })
  getProductStatistics() {
    return this.statisticsService.getProductStatistics();
  }

  @Get('users')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Получить статистику по пользователям' })
  @ApiResponse({ status: 200, description: 'Статистика пользователей' })
  getUserStatistics() {
    return this.statisticsService.getUserStatistics();
  }
}
