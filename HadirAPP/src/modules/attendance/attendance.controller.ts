import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
      throw new Error('Selfie image is required');
    }

    return this.attendanceService.submitAttendance({
      scheduleId: body.scheduleId,
      studentName: body.studentName,
      studentNpm: body.studentNpm,
      selfieImage: file.path,
    });
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
}
