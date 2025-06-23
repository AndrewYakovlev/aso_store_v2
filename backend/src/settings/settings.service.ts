import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateStorePhoneDto,
  UpdateStorePhoneDto,
  CreateStoreAddressDto,
  UpdateStoreAddressDto,
} from './dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  // Phone Management
  async getPhones() {
    return this.prisma.storePhone.findMany({
      orderBy: [{ isMain: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async createPhone(data: CreateStorePhoneDto) {
    // If this is the main phone, remove main flag from others
    if (data.isMain) {
      await this.prisma.storePhone.updateMany({
        data: { isMain: false },
      });
    }

    return this.prisma.storePhone.create({
      data,
    });
  }

  async updatePhone(id: string, data: UpdateStorePhoneDto) {
    const phone = await this.prisma.storePhone.findUnique({
      where: { id },
    });

    if (!phone) {
      throw new NotFoundException('Phone not found');
    }

    // If setting as main phone, remove main flag from others
    if (data.isMain) {
      await this.prisma.storePhone.updateMany({
        where: { id: { not: id } },
        data: { isMain: false },
      });
    }

    return this.prisma.storePhone.update({
      where: { id },
      data,
    });
  }

  async deletePhone(id: string) {
    const phone = await this.prisma.storePhone.findUnique({
      where: { id },
    });

    if (!phone) {
      throw new NotFoundException('Phone not found');
    }

    return this.prisma.storePhone.delete({
      where: { id },
    });
  }

  // Address Management
  async getAddresses() {
    return this.prisma.storeAddress.findMany({
      orderBy: [{ type: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async getMainAddress() {
    return this.prisma.storeAddress.findFirst({
      where: { type: 'main', isActive: true },
    });
  }

  async createAddress(data: CreateStoreAddressDto) {
    return this.prisma.storeAddress.create({
      data,
    });
  }

  async updateAddress(id: string, data: UpdateStoreAddressDto) {
    const address = await this.prisma.storeAddress.findUnique({
      where: { id },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return this.prisma.storeAddress.update({
      where: { id },
      data,
    });
  }

  async deleteAddress(id: string) {
    const address = await this.prisma.storeAddress.findUnique({
      where: { id },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return this.prisma.storeAddress.delete({
      where: { id },
    });
  }

  // General Settings
  async getSetting(key: string) {
    const setting = await this.prisma.storeSettings.findUnique({
      where: { key },
    });

    return setting?.value || null;
  }

  async setSetting(key: string, value: any) {
    return this.prisma.storeSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  async getSettings(keys?: string[]) {
    const where = keys ? { key: { in: keys } } : {};
    const settings = await this.prisma.storeSettings.findMany({ where });

    return settings.reduce(
      (acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      },
      {} as Record<string, any>,
    );
  }
}
