import { Controller, Get, Post, Put, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  async getUsers(@Query('role') role?: string, @Query('isActive') isActive?: string) {
    return this.adminService.getAllUsers(role, isActive);
  }

  @Get('users/stats')
  async getUsersStats() {
    return this.adminService.getUsersStats();
  }

  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Post('users')
  async createUser(@Body() data: any) {
    return this.adminService.createUser(data);
  }

  @Put('users/:id')
  async updateUser(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateUser(id, data);
  }

  @Patch('users/:id/status')
  async toggleUserStatus(@Param('id') id: string) {
    return this.adminService.toggleUserStatus(id);
  }

  @Patch('users/:id/password')
  async resetPassword(@Param('id') id: string, @Body() data: { newPassword: string }) {
    return this.adminService.resetPassword(id, data.newPassword);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  // ==================== CLASSES MANAGEMENT ====================

  @Get('classes')
  async getClasses(
    @Query('semester') semester?: string,
    @Query('courseId') courseId?: string,
  ) {
    return this.adminService.getAllClasses(semester, courseId);
  }

  @Get('classes/stats')
  async getClassesStats() {
    return this.adminService.getClassesStats();
  }

  @Get('classes/:id')
  async getClassById(@Param('id') id: string) {
    return this.adminService.getClassById(id);
  }

  @Post('classes')
  async createClass(
    @Body() data: { courseId: string; semester: string; capacity?: number },
  ) {
    return this.adminService.createClass(data);
  }

  @Put('classes/:id')
  async updateClass(
    @Param('id') id: string,
    @Body() data: { courseId?: string; semester?: string; capacity?: number },
  ) {
    return this.adminService.updateClass(id, data);
  }

  @Delete('classes/:id')
  async deleteClass(@Param('id') id: string) {
    return this.adminService.deleteClass(id);
  }

  // ==================== OTHER ENDPOINTS ====================

  @Get('attendance')
  async getAttendanceReport(@Query('classId') classId?: string) {
    return this.adminService.getAttendanceReport(classId);
  }

  @Get('attendance/today-stats')
  async getTodayAttendanceStats() {
    return this.adminService.getTodayAttendanceStats();
  }

  @Get('attendance/chart/weekly')
  async getWeeklyChart() {
    return this.adminService.getWeeklyAttendanceChart();
  }

  @Get('attendance/chart/monthly')
  async getMonthlyChart() {
    return this.adminService.getMonthlyAttendanceChart();
  }

  @Get('attendance/sessions')
  async getAttendanceSessions(
    @Query('classId') classId?: string,
    @Query('teacherId') teacherId?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.getAttendanceSessions({
      classId,
      teacherId,
      status,
      startDate,
      endDate,
    });
  }

  @Get('attendance/sessions/:id')
  async getSessionDetail(@Param('id') id: string) {
    return this.adminService.getSessionDetail(id);
  }

  // Schedule Management Endpoints
  @Get('schedules')
  async getAllSchedules(
    @Query('classId') classId?: string,
    @Query('teacherId') teacherId?: string,
    @Query('dayOfWeek') dayOfWeek?: string,
  ) {
    return this.adminService.getAllSchedules({ classId, teacherId, dayOfWeek });
  }

  @Get('schedules/:id')
  async getScheduleById(@Param('id') id: string) {
    return this.adminService.getScheduleById(id);
  }

  @Post('schedules')
  async createSchedule(@Body() data: any) {
    return this.adminService.createSchedule(data);
  }

  @Put('schedules/:id')
  async updateSchedule(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateSchedule(id, data);
  }

  @Delete('schedules/:id')
  async deleteSchedule(@Param('id') id: string) {
    return this.adminService.deleteSchedule(id);
  }

  // Helper endpoints untuk form
  @Get('teachers/list')
  async getTeachersList() {
    return this.adminService.getTeachersList();
  }

  @Get('classes/list')
  async getClassesList() {
    return this.adminService.getClassesList();
  }

  @Get('courses/list')
  async getCoursesList() {
    return this.adminService.getCoursesList();
  }

  @Get('wifi/list')
  async getWifiNetworksList() {
    return this.adminService.getWifiNetworksList();
  }
}
