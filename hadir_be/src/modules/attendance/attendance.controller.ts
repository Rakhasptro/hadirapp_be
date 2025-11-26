import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request, UseInterceptors, UploadedFile, Req, BadRequestException, Query, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('submit')
  @UseInterceptors(
    FileInterceptor('selfie', {
      storage: diskStorage({
        destination: './uploads/selfies',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `selfie-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async submitAttendance(
    @Body() body: { scheduleId: string; studentName: string; studentNpm: string },
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Selfie image is required');
    }

    return this.attendanceService.submitAttendance({
      scheduleId: body.scheduleId,
      studentName: body.studentName,
      studentNpm: body.studentNpm,
      selfieImage: file.path,
      // if the upload endpoint is used by an authenticated student, include their email
      studentEmail: (body as any).studentEmail ?? undefined,
    });
  }

  @Get('session/:sessionId')
  async checkSession(@Param('sessionId') sessionId: string) {
    const res = await this.attendanceService.getSessionByToken(sessionId);
    if (!res) return { valid: false, message: 'Session not found' };
    return { valid: res.isActive, schedule: res.schedule };
  }

  @Post('submit/mobile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  async submitMobile(
    @Body() body: { sessionId: string; studentId?: string; imageUrl?: string; imageBase64?: string; name?: string; timestamp?: string },
    @Req() req,
  ) {
    const studentId = body.studentId || req.user?.sub || req.user?.userId;
    if (!studentId) throw new BadRequestException('studentId is required');

    return this.attendanceService.createAttendanceFromMobile({
      sessionId: body.sessionId,
      studentId,
      imageUrl: body.imageUrl,
      imageBase64: body.imageBase64,
      name: body.name,
      timestamp: body.timestamp,
      email: req.user?.email ?? (body as any).email ?? undefined,
    });
  }

  @Get('history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  async getHistory(@Req() req) {
    const userId = req.user?.sub || req.user?.userId || null;
    const email = req.user?.email || null;
    if (!userId && !email) throw new BadRequestException('Unauthorized');

    // If email available, prefer exact email lookup to avoid broad partial matches
    if (email) {
      return this.attendanceService.listAttendancesByEmail(email);
    }

    // Fallback: try matching by user id and email local-part/other identifiers
    const identifiers = [userId].filter(Boolean);
    return this.attendanceService.listAttendancesByStudent(identifiers);
  }

  @Get('schedule/:scheduleId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER')
  async getScheduleAttendances(@Request() req, @Param('scheduleId') scheduleId: string) {
    const teacherId = req.user.teacherId || req.user.profile?.id;
    if (!teacherId) {
      throw new Error('Teacher ID not found');
    }
    return this.attendanceService.getScheduleAttendances(scheduleId, teacherId);
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER')
  async getPendingAttendances(@Request() req) {
    const teacherId = req.user.teacherId || req.user.profile?.id;
    if (!teacherId) {
      throw new Error('Teacher ID not found');
    }
    return this.attendanceService.getPendingAttendances(teacherId);
  }

  @Patch(':id/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER')
  async confirmAttendance(@Request() req, @Param('id') id: string) {
    const teacherId = req.user.teacherId || req.user.profile?.id;
    if (!teacherId) {
      throw new Error('Teacher ID not found');
    }
    return this.attendanceService.confirmAttendance(id, teacherId);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER')
  async rejectAttendance(@Request() req, @Param('id') id: string, @Body('reason') reason: string) {
    const teacherId = req.user.teacherId || req.user.profile?.id;
    if (!teacherId) {
      throw new Error('Teacher ID not found');
    }
    return this.attendanceService.rejectAttendance(id, teacherId, reason);
  }

  @Get('export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER')
  async exportCsv(@Query('session_id') sessionId: string, @Query('type') type: string, @Req() req, @Res() res: Response) {
    if (!sessionId) {
      return res.status(400).json({ message: 'session_id is required' });
    }

    try {
      const csv = await this.attendanceService.exportAttendancesCsv(sessionId);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="attendance_${sessionId}.csv"`);
      return res.send(csv);
    } catch (err) {
      return res.status(404).json({ message: err?.message || 'Not found' });
    }
  }
}
