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
import { PaymentMethodsService } from './payment-methods.service';
import {
  CreatePaymentMethodDto,
  UpdatePaymentMethodDto,
  PaymentMethodDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('payment-methods')
@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать метод оплаты' })
  @ApiResponse({
    status: 201,
    description: 'Метод оплаты создан',
    type: PaymentMethodDto,
  })
  create(@Body() createPaymentMethodDto: CreatePaymentMethodDto) {
    return this.paymentMethodsService.create(createPaymentMethodDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список методов оплаты' })
  @ApiQuery({
    name: 'onlyActive',
    required: false,
    type: Boolean,
    description: 'Только активные методы',
  })
  @ApiResponse({
    status: 200,
    description: 'Список методов оплаты',
    type: [PaymentMethodDto],
  })
  findAll(@Query('onlyActive') onlyActive?: string) {
    return this.paymentMethodsService.findAll(onlyActive === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить метод оплаты по ID' })
  @ApiResponse({
    status: 200,
    description: 'Метод оплаты',
    type: PaymentMethodDto,
  })
  @ApiResponse({ status: 404, description: 'Метод оплаты не найден' })
  findOne(@Param('id') id: string) {
    return this.paymentMethodsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить метод оплаты' })
  @ApiResponse({
    status: 200,
    description: 'Метод оплаты обновлен',
    type: PaymentMethodDto,
  })
  @ApiResponse({ status: 404, description: 'Метод оплаты не найден' })
  update(
    @Param('id') id: string,
    @Body() updatePaymentMethodDto: UpdatePaymentMethodDto,
  ) {
    return this.paymentMethodsService.update(id, updatePaymentMethodDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить метод оплаты' })
  @ApiResponse({ status: 200, description: 'Метод оплаты удален' })
  @ApiResponse({ status: 404, description: 'Метод оплаты не найден' })
  @ApiResponse({
    status: 409,
    description: 'Метод оплаты используется в заказах',
  })
  remove(@Param('id') id: string) {
    return this.paymentMethodsService.remove(id);
  }

  @Post('reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Изменить порядок сортировки методов оплаты' })
  @ApiResponse({ status: 200, description: 'Порядок сортировки обновлен' })
  reorder(@Body() items: { id: string; sortOrder: number }[]) {
    return this.paymentMethodsService.reorder(items);
  }
}
