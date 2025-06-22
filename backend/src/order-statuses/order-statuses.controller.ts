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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { OrderStatusesService } from './order-statuses.service';
import {
  CreateOrderStatusDto,
  UpdateOrderStatusDto,
  OrderStatusDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('order-statuses')
@Controller('order-statuses')
export class OrderStatusesController {
  constructor(private readonly orderStatusesService: OrderStatusesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать статус заказа' })
  @ApiResponse({
    status: 201,
    description: 'Статус создан',
    type: OrderStatusDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Статус с таким кодом уже существует',
  })
  create(@Body() createOrderStatusDto: CreateOrderStatusDto) {
    return this.orderStatusesService.create(createOrderStatusDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список статусов заказов' })
  @ApiQuery({
    name: 'onlyActive',
    required: false,
    type: Boolean,
    description: 'Только активные статусы',
  })
  @ApiResponse({
    status: 200,
    description: 'Список статусов',
    type: [OrderStatusDto],
  })
  findAll(@Query('onlyActive') onlyActive?: string) {
    return this.orderStatusesService.findAll(onlyActive === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить статус по ID' })
  @ApiResponse({
    status: 200,
    description: 'Статус заказа',
    type: OrderStatusDto,
  })
  @ApiResponse({ status: 404, description: 'Статус не найден' })
  findOne(@Param('id') id: string) {
    return this.orderStatusesService.findOne(id);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Получить статус по коду' })
  @ApiResponse({
    status: 200,
    description: 'Статус заказа',
    type: OrderStatusDto,
  })
  @ApiResponse({ status: 404, description: 'Статус не найден' })
  findByCode(@Param('code') code: string) {
    return this.orderStatusesService.findByCode(code);
  }

  @Get(':id/transitions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить возможные переходы из статуса' })
  @ApiResponse({
    status: 200,
    description: 'Список доступных статусов для перехода',
    type: [OrderStatusDto],
  })
  getTransitions(@Param('id') id: string) {
    return this.orderStatusesService.getTransitions(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить статус заказа' })
  @ApiResponse({
    status: 200,
    description: 'Статус обновлен',
    type: OrderStatusDto,
  })
  @ApiResponse({ status: 404, description: 'Статус не найден' })
  update(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.orderStatusesService.update(id, updateOrderStatusDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить статус заказа' })
  @ApiResponse({ status: 200, description: 'Статус удален' })
  @ApiResponse({ status: 404, description: 'Статус не найден' })
  @ApiResponse({
    status: 409,
    description: 'Статус используется или является системным',
  })
  remove(@Param('id') id: string) {
    return this.orderStatusesService.remove(id);
  }

  @Post('reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Изменить порядок сортировки статусов' })
  @ApiResponse({ status: 200, description: 'Порядок сортировки обновлен' })
  reorder(@Body() items: { id: string; sortOrder: number }[]) {
    return this.orderStatusesService.reorder(items);
  }
}
