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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserFilterDto, UserDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Создать пользователя' })
  @ApiResponse({
    status: 201,
    description: 'Пользователь создан',
    type: UserDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Пользователь с таким телефоном уже существует',
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Получить список пользователей' })
  @ApiResponse({ status: 200, description: 'Список пользователей' })
  findAll(@Query() filter: UserFilterDto) {
    return this.usersService.findAll(filter);
  }

  @Post('find-or-create-by-phone')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Найти или создать пользователя по телефону' })
  @ApiResponse({
    status: 200,
    description: 'Пользователь найден или создан',
  })
  findOrCreateByPhone(@Body() body: { phone: string; name?: string }) {
    return this.usersService.findOrCreateByPhone(body.phone, body.name);
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Получить статистику по пользователям' })
  @ApiResponse({ status: 200, description: 'Статистика' })
  getStatistics() {
    return this.usersService.getStatistics();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Получить пользователя по ID' })
  @ApiResponse({
    status: 200,
    description: 'Данные пользователя',
    type: UserDto,
  })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Обновить данные пользователя' })
  @ApiResponse({ status: 200, description: 'Данные обновлены', type: UserDto })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  @ApiResponse({
    status: 409,
    description: 'Пользователь с таким телефоном уже существует',
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Удалить пользователя' })
  @ApiResponse({ status: 200, description: 'Пользователь удален' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  @ApiResponse({
    status: 409,
    description: 'Невозможно удалить пользователя с заказами',
  })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Get(':id/cart')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Получить корзину пользователя' })
  @ApiResponse({ status: 200, description: 'Корзина пользователя' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  getUserCart(@Param('id') id: string) {
    return this.usersService.getUserCart(id);
  }

  @Get(':id/favorites')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Получить избранное пользователя' })
  @ApiResponse({ status: 200, description: 'Избранное пользователя' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  getUserFavorites(@Param('id') id: string) {
    return this.usersService.getUserFavorites(id);
  }

  @Get(':id/chats')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Получить чаты пользователя' })
  @ApiResponse({ status: 200, description: 'Чаты пользователя' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  getUserChats(@Param('id') id: string) {
    return this.usersService.getUserChats(id);
  }

  @Get(':id/anonymous-users')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Получить связанных анонимных пользователей' })
  @ApiResponse({ status: 200, description: 'Список анонимных пользователей' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  getUserAnonymousUsers(@Param('id') id: string) {
    return this.usersService.getUserAnonymousUsers(id);
  }
}
