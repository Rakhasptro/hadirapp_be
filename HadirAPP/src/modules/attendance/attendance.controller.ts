import { Body, Controller, Get, Param, Post, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // GURU buka sesi absensi
  @Post('session')
  @Roles('TEACHER')
  async createSession(
    @Body() body: { scheduleId: string; description?: string },
    @Req() req,
  ) {
    if (!body || !body.scheduleId) {
      throw new BadRequestException('scheduleId harus diisi');
    }
    const teacherId = req.user.userId;
    return this.attendanceService.createSession(teacherId, body.scheduleId, body.description);
  }

  // SISWA melakukan absensi
  @Post('mark')
  @Roles('STUDENT')
  async mark(
    @Body() body: { sessionId: string; status?: string },
    @Req() req,
  ) {
    if (!body || !body.sessionId) {
      throw new BadRequestException('sessionId harus diisi');
    }
    const studentId = req.user.userId;
    return this.attendanceService.markAttendance(studentId, body.sessionId, body.status);
  }

  // GURU / ADMIN melihat laporan sesi
  @Get('session/:id')
  @Roles('ADMIN', 'TEACHER')
  async getSession(@Param('id') id: string) {
    return this.attendanceService.getSessionAttendance(id);
  }

  // Tutup sesi absensi
  @Post('session/:id/close')
  @Roles('ADMIN', 'TEACHER')
  async close(@Param('id') id: string) {
    return this.attendanceService.closeSession(id);
  }
}
