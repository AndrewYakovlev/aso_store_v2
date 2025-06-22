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
import { DeliveryMethodsService } from './delivery-methods.service';
import {
  CreateDeliveryMethodDto,
  UpdateDeliveryMethodDto,
  DeliveryMethodDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('delivery-methods')
@Controller('delivery-methods')
export class DeliveryMethodsController {
  constructor(
    private readonly deliveryMethodsService: DeliveryMethodsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать метод доставки' })
  @ApiResponse({
    status: 201,
    description: 'Метод доставки создан',
    type: DeliveryMethodDto,
  })
  create(@Body() createDeliveryMethodDto: CreateDeliveryMethodDto) {
    return this.deliveryMethodsService.create(createDeliveryMethodDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список методов доставки' })
  @ApiQuery({
    name: 'onlyActive',
    required: false,
    type: Boolean,
    description: 'Только активные методы',
  })
  @ApiResponse({
    status: 200,
    description: 'Список методов доставки',
    type: [DeliveryMethodDto],
  })
  findAll(@Query('onlyActive') onlyActive?: string) {
    return this.deliveryMethodsService.findAll(onlyActive === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить метод доставки по ID' })
  @ApiResponse({
    status: 200,
    description: 'Метод доставки',
    type: DeliveryMethodDto,
  })
  @ApiResponse({ status: 404, description: 'Метод доставки не найден' })
  findOne(@Param('id') id: string) {
    return this.deliveryMethodsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить метод доставки' })
  @ApiResponse({
    status: 200,
    description: 'Метод доставки обновлен',
    type: DeliveryMethodDto,
  })
  @ApiResponse({ status: 404, description: 'Метод доставки не найден' })
  update(
    @Param('id') id: string,
    @Body() updateDeliveryMethodDto: UpdateDeliveryMethodDto,
  ) {
    return this.deliveryMethodsService.update(id, updateDeliveryMethodDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить метод доставки' })
  @ApiResponse({ status: 200, description: 'Метод доставки удален' })
  @ApiResponse({ status: 404, description: 'Метод доставки не найден' })
  @ApiResponse({
    status: 409,
    description: 'Метод доставки используется в заказах',
  })
  remove(@Param('id') id: string) {
    return this.deliveryMethodsService.remove(id);
  }

  @Post('reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Изменить порядок сортировки методов доставки' })
  @ApiResponse({ status: 200, description: 'Порядок сортировки обновлен' })
  reorder(@Body() items: { id: string; sortOrder: number }[]) {
    return this.deliveryMethodsService.reorder(items);
  }
}
