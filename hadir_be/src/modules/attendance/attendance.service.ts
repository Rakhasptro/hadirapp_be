import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { attendances_status } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async submitAttendance(data: {
    scheduleId: string;
    studentName: string;
    studentNpm: string;
    selfieImage: string;
  }) {
    const schedule = await this.prisma.course_schedules.findUnique({
      where: { id: data.scheduleId },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    const existing = await this.prisma.attendances.findUnique({
      where: {
        scheduleId_studentNpm: {
          scheduleId: data.scheduleId,
          studentNpm: data.studentNpm,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('You have already submitted attendance for this schedule');
    }

    const attendance = await this.prisma.attendances.create({
      data: {
        id: uuidv4(),
        scheduleId: data.scheduleId,
        studentName: data.studentName,
        studentNpm: data.studentNpm,
        selfieImage: data.selfieImage,
        status: attendances_status.PENDING,
      },
      include: {
        schedule: {
          include: {
            teachers: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return attendance;
  }

  async getScheduleAttendances(scheduleId: string, teacherId: string) {
    const schedule = await this.prisma.course_schedules.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    if (schedule.teacherId !== teacherId) {
      throw new ForbiddenException('You can only view attendances for your own schedules');
    }

    return this.prisma.attendances.findMany({
      where: { scheduleId },
      orderBy: { scannedAt: 'desc' },
    });
  }

  async confirmAttendance(attendanceId: string, teacherId: string) {
    const attendance = await this.prisma.attendances.findUnique({
      where: { id: attendanceId },
      include: {
        schedule: true,
      },
    });

    if (!attendance) {
      throw new NotFoundException('Attendance not found');
    }

    if (attendance.schedule.teacherId !== teacherId) {
      throw new ForbiddenException('You can only confirm attendances for your own schedules');
    }

    return this.prisma.attendances.update({
      where: { id: attendanceId },
      data: {
        status: attendances_status.CONFIRMED,
        confirmedBy: teacherId,
        confirmedAt: new Date(),
      },
    });
  }

  async rejectAttendance(attendanceId: string, teacherId: string, reason: string) {
    const attendance = await this.prisma.attendances.findUnique({
      where: { id: attendanceId },
      include: {
        schedule: true,
      },
    });

    if (!attendance) {
      throw new NotFoundException('Attendance not found');
    }

    if (attendance.schedule.teacherId !== teacherId) {
      throw new ForbiddenException('You can only reject attendances for your own schedules');
    }

    return this.prisma.attendances.update({
      where: { id: attendanceId },
      data: {
        status: attendances_status.REJECTED,
        confirmedBy: teacherId,
        confirmedAt: new Date(),
        rejectionReason: reason,
      },
    });
  }

  async getPendingAttendances(teacherId: string) {
    return this.prisma.attendances.findMany({
      where: {
        status: attendances_status.PENDING,
        schedule: {
          teacherId,
        },
      },
      include: {
        schedule: {
          select: {
            courseName: true,
            courseCode: true,
            date: true,
            startTime: true,
            endTime: true,
          },
        },
      },
      orderBy: { scannedAt: 'desc' },
    });
  }
}
