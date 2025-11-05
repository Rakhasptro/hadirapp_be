import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get('active')
  @UseGuards(JwtAuthGuard)
  getActiveSessions() {
    return this.schedulesService.getActiveSessions();
  }

  // Endpoint untuk debugging - cek semua jadwal
  @Get('debug/all')
  @UseGuards(JwtAuthGuard)
  getAllSchedulesDebug() {
    return this.schedulesService.getAllSchedules();
  }

  // Endpoint untuk debugging - cek jadwal hari ini
  @Get('debug/today')
  @UseGuards(JwtAuthGuard)
  getTodaySchedules() {
    return this.schedulesService.getTodaySchedules();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  createSchedule(@Body() body: any) {
    return this.schedulesService.createSchedule(body);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getAllSchedules() {
    return this.schedulesService.getAllSchedules();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getScheduleById(@Param('id') id: string) {
    return this.schedulesService.getScheduleById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  updateSchedule(@Param('id') id: string, @Body() body: any) {
    return this.schedulesService.updateSchedule(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteSchedule(@Param('id') id: string) {
    return this.schedulesService.deleteSchedule(id);
  }
}
