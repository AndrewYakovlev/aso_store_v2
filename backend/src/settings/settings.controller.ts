import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { SettingsService } from './settings.service';
import {
  StorePhoneDto,
  CreateStorePhoneDto,
  UpdateStorePhoneDto,
  StoreAddressDto,
  CreateStoreAddressDto,
  UpdateStoreAddressDto,
  UpdateSettingDto,
} from './dto';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // Phone endpoints
  @Get('phones')
  @ApiOperation({ summary: 'Get all store phone numbers' })
  @ApiResponse({ status: 200, type: [StorePhoneDto] })
  async getPhones() {
    return this.settingsService.getPhones();
  }

  @Post('phones')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new store phone number' })
  @ApiResponse({ status: 201, type: StorePhoneDto })
  async createPhone(@Body() data: CreateStorePhoneDto) {
    return this.settingsService.createPhone(data);
  }

  @Put('phones/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update store phone number' })
  @ApiResponse({ status: 200, type: StorePhoneDto })
  async updatePhone(
    @Param('id') id: string,
    @Body() data: UpdateStorePhoneDto,
  ) {
    return this.settingsService.updatePhone(id, data);
  }

  @Delete('phones/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete store phone number' })
  @ApiResponse({ status: 200, type: StorePhoneDto })
  async deletePhone(@Param('id') id: string) {
    return this.settingsService.deletePhone(id);
  }

  // Address endpoints
  @Get('addresses')
  @ApiOperation({ summary: 'Get all store addresses' })
  @ApiResponse({ status: 200, type: [StoreAddressDto] })
  async getAddresses() {
    return this.settingsService.getAddresses();
  }

  @Get('addresses/main')
  @ApiOperation({ summary: 'Get main store address' })
  @ApiResponse({ status: 200, type: StoreAddressDto })
  async getMainAddress() {
    return this.settingsService.getMainAddress();
  }

  @Post('addresses')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new store address' })
  @ApiResponse({ status: 201, type: StoreAddressDto })
  async createAddress(@Body() data: CreateStoreAddressDto) {
    return this.settingsService.createAddress(data);
  }

  @Put('addresses/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update store address' })
  @ApiResponse({ status: 200, type: StoreAddressDto })
  async updateAddress(
    @Param('id') id: string,
    @Body() data: UpdateStoreAddressDto,
  ) {
    return this.settingsService.updateAddress(id, data);
  }

  @Delete('addresses/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete store address' })
  @ApiResponse({ status: 200, type: StoreAddressDto })
  async deleteAddress(@Param('id') id: string) {
    return this.settingsService.deleteAddress(id);
  }

  // General settings
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all general settings' })
  async getSettings() {
    return this.settingsService.getSettings();
  }

  @Get(':key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get specific setting by key' })
  async getSetting(@Param('key') key: string) {
    const value = await this.settingsService.getSetting(key);
    return { key, value };
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update setting value' })
  async updateSetting(@Body() data: UpdateSettingDto) {
    return this.settingsService.setSetting(data.key, data.value);
  }
}
