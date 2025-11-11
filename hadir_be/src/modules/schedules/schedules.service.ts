import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { course_schedules_status } from '@prisma/client';
import * as QRCode from 'qrcode';
import { randomBytes } from 'crypto';

@Injectable()
export class SchedulesService {
  constructor(private prisma: PrismaService) {}

  private generateQRToken(): string {
    return randomBytes(16).toString('hex');
  }

  private async generateQRCodeImage(token: string): Promise<string> {
    try {
      const qrDataUrl = await QRCode.toDataURL(token, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        width: 300,
        margin: 2,
      });
      return qrDataUrl;
    } catch (error) {
      throw new BadRequestException('Failed to generate QR code');
    }
  }

  async createSchedule(teacherId: string, data: any) {
    const teacher = await this.prisma.teachers.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    const qrToken = this.generateQRToken();
    const qrCodeImage = await this.generateQRCodeImage(qrToken);

    const schedule = await this.prisma.course_schedules.create({
      data: {
        id: uuidv4(),
        teacherId,
        courseName: data.courseName,
        courseCode: data.courseCode,
        date: new Date(data.date),
        startTime: data.startTime,
        endTime: data.endTime,
        room: data.room,
        topic: data.topic,
        qrCode: qrToken,
        qrCodeImage,
        status: course_schedules_status.SCHEDULED,
      },
      include: {
        teachers: {
          select: {
            id: true,
            name: true,
            nip: true,
          },
        },
      },
    });

    return schedule;
  }

  async getTeacherSchedules(teacherId: string, filter?: any) {
    const where: any = { teacherId };

    if (filter?.status) {
      where.status = filter.status;
    }

    if (filter?.startDate || filter?.endDate) {
      where.date = {};
      if (filter.startDate) where.date.gte = new Date(filter.startDate);
      if (filter.endDate) where.date.lte = new Date(filter.endDate);
    }

    return this.prisma.course_schedules.findMany({
      where,
      include: {
        teachers: {
          select: {
            id: true,
            name: true,
            nip: true,
          },
        },
        _count: {
          select: {
            attendances: true,
          },
        },
      },
      orderBy: [
        { date: 'desc' },
        { startTime: 'asc' },
      ],
    });
  }

  async getScheduleById(scheduleId: string) {
    const schedule = await this.prisma.course_schedules.findUnique({
      where: { id: scheduleId },
      include: {
        teachers: {
          select: {
            id: true,
            name: true,
            nip: true,
            email: true,
          },
        },
        attendances: {
          orderBy: { scannedAt: 'desc' },
        },
      },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    return schedule;
  }

  async verifyQRCode(qrCode: string) {
    const schedule = await this.prisma.course_schedules.findUnique({
      where: { qrCode },
      include: {
        teachers: {
          select: {
            name: true,
            nip: true,
          },
        },
      },
    });

    if (!schedule) {
      throw new NotFoundException('Invalid QR code');
    }

    if (schedule.status === course_schedules_status.CLOSED) {
      throw new BadRequestException('This schedule is closed');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const scheduleDate = new Date(schedule.date);
    scheduleDate.setHours(0, 0, 0, 0);

    if (scheduleDate.getTime() !== today.getTime()) {
      throw new BadRequestException('This schedule is not for today');
    }

    return {
      id: schedule.id,
      courseName: schedule.courseName,
      courseCode: schedule.courseCode,
      date: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      room: schedule.room,
      topic: schedule.topic,
      teacher: schedule.teachers,
      status: schedule.status,
    };
  }

  async updateScheduleStatus(scheduleId: string, teacherId: string, status: course_schedules_status) {
    const schedule = await this.prisma.course_schedules.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    if (schedule.teacherId !== teacherId) {
      throw new ForbiddenException('You can only update your own schedules');
    }

    return this.prisma.course_schedules.update({
      where: { id: scheduleId },
      data: { status },
      include: {
        teachers: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async updateSchedule(scheduleId: string, teacherId: string, data: any) {
    const schedule = await this.prisma.course_schedules.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    if (schedule.teacherId !== teacherId) {
      throw new ForbiddenException('You can only update your own schedules');
    }

    if (schedule.status === course_schedules_status.CLOSED) {
      throw new BadRequestException('Cannot update closed schedule');
    }

    const updateData: any = {};
    if (data.courseName) updateData.courseName = data.courseName;
    if (data.courseCode) updateData.courseCode = data.courseCode;
    if (data.date) updateData.date = new Date(data.date);
    if (data.startTime) updateData.startTime = data.startTime;
    if (data.endTime) updateData.endTime = data.endTime;
    if (data.room !== undefined) updateData.room = data.room;
    if (data.topic !== undefined) updateData.topic = data.topic;

    return this.prisma.course_schedules.update({
      where: { id: scheduleId },
      data: updateData,
      include: {
        teachers: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async deleteSchedule(scheduleId: string, teacherId: string) {
    const schedule = await this.prisma.course_schedules.findUnique({
      where: { id: scheduleId },
      include: {
        _count: {
          select: {
            attendances: true,
          },
        },
      },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    if (schedule.teacherId !== teacherId) {
      throw new ForbiddenException('You can only delete your own schedules');
    }

    if (schedule._count.attendances > 0) {
      throw new BadRequestException('Cannot delete schedule with attendance records');
    }

    await this.prisma.course_schedules.delete({
      where: { id: scheduleId },
    });

    return { message: 'Schedule deleted successfully' };
  }

  async getTodayActiveSchedules(teacherId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.course_schedules.findMany({
      where: {
        teacherId,
        date: {
          gte: today,
          lt: tomorrow,
        },
        status: {
          in: [course_schedules_status.SCHEDULED, course_schedules_status.ACTIVE],
        },
      },
      include: {
        _count: {
          select: {
            attendances: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }
}
