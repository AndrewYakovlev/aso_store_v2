import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnonymousUsersService } from './anonymous-users.service';
import { AnonymousUserFilterDto } from './dto/anonymous-user-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Anonymous Users')
@Controller('anonymous-users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AnonymousUsersController {
  constructor(private readonly anonymousUsersService: AnonymousUsersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get all anonymous users (admin/manager only)' })
  async findAll(
    @Query(new ValidationPipe({ transform: true }))
    filter: AnonymousUserFilterDto,
  ) {
    return this.anonymousUsersService.findAll(filter);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get anonymous user by ID (admin/manager only)' })
  async findOne(@Param('id') id: string) {
    return this.anonymousUsersService.findOne(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete anonymous user (admin only)' })
  async remove(@Param('id') id: string) {
    await this.anonymousUsersService.remove(id);
  }
}
