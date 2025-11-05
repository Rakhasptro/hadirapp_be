import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class WifiService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    ssid: string;
    description?: string;
    ipRange: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
  }) {
    return this.prisma.wifi_networks.create({
      data: {
        id: uuidv4(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async findAll() {
    return this.prisma.wifi_networks.findMany({
      where: { isActive: true },
    });
  }

  async findOne(id: string) {
    const wifi = await this.prisma.wifi_networks.findUnique({
      where: { id },
    });
    if (!wifi) throw new NotFoundException('WiFi network not found');
    return wifi;
  }

  async update(id: string, data: Partial<{
    ssid: string;
    description: string;
    ipRange: string;
    latitude: number;
    longitude: number;
    radius: number;
    isActive: boolean;
  }>) {
    const wifi = await this.findOne(id);
    return this.prisma.wifi_networks.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async remove(id: string) {
    const wifi = await this.findOne(id);
    return this.prisma.wifi_networks.update({
      where: { id },
      data: { isActive: false, updatedAt: new Date() },
    });
  }
}
