import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { WifiService } from './wifi.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('wifi')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WifiController {
  constructor(private readonly wifiService: WifiService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() createWifiDto: {
    ssid: string;
    description?: string;
    ipRange: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
  }) {
    return this.wifiService.create(createWifiDto);
  }

  @Get()
  @Roles('ADMIN', 'TEACHER')
  findAll() {
    return this.wifiService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'TEACHER')
  findOne(@Param('id') id: string) {
    return this.wifiService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() updateWifiDto: Partial<{
    ssid: string;
    description: string;
    ipRange: string;
    latitude: number;
    longitude: number;
    radius: number;
    isActive: boolean;
  }>) {
    return this.wifiService.update(id, updateWifiDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.wifiService.remove(id);
  }
}
