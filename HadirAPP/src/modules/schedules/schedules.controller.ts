import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('schedules')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('TEACHER')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  async createSchedule(@Request() req, @Body() body: any) {
    const teacherId = req.user.teacherId || req.user.profile?.id;
    if (!teacherId) {
      throw new Error('Teacher ID not found in token');
    }
    return this.schedulesService.createSchedule(teacherId, body);
  }

  @Get()
  async getTeacherSchedules(@Request() req, @Query() query: any) {
    const teacherId = req.user.teacherId || req.user.profile?.id;
    if (!teacherId) {
      throw new Error('Teacher ID not found in token');
    }
    return this.schedulesService.getTeacherSchedules(teacherId, query);
  }

  @Get('today')
  async getTodaySchedules(@Request() req) {
    const teacherId = req.user.teacherId || req.user.profile?.id;
    if (!teacherId) {
      throw new Error('Teacher ID not found in token');
    }
    return this.schedulesService.getTodayActiveSchedules(teacherId);
  }

  @Get(':id')
  async getScheduleById(@Param('id') id: string) {
    return this.schedulesService.getScheduleById(id);
  }

  @Patch(':id/status')
  async updateStatus(@Request() req, @Param('id') id: string, @Body('status') status: string) {
    const teacherId = req.user.teacherId || req.user.profile?.id;
    if (!teacherId) {
      throw new Error('Teacher ID not found in token');
    }
    return this.schedulesService.updateScheduleStatus(id, teacherId, status as any);
  }

  @Put(':id')
  async updateSchedule(@Request() req, @Param('id') id: string, @Body() body: any) {
    const teacherId = req.user.teacherId || req.user.profile?.id;
    if (!teacherId) {
      throw new Error('Teacher ID not found in token');
    }
    return this.schedulesService.updateSchedule(id, teacherId, body);
  }

  @Delete(':id')
  async deleteSchedule(@Request() req, @Param('id') id: string) {
    const teacherId = req.user.teacherId || req.user.profile?.id;
    if (!teacherId) {
      throw new Error('Teacher ID not found in token');
    }
    return this.schedulesService.deleteSchedule(id, teacherId);
  }
}
