import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { attendances_status } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

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

  // Find session by QR token or by id — used by mobile to validate session
  async getSessionByToken(token: string) {
    const schedule = await this.prisma.course_schedules.findFirst({
      where: {
        OR: [{ qrCode: token }, { id: token }],
      },
      include: { teachers: true },
    });

    if (!schedule) return null;

    // consider session active only when status is ACTIVE
    const isActive = schedule.status === 'ACTIVE';
    return { schedule, isActive };
  }

  // Mobile-friendly submission (JSON): accepts session token or id, studentId (npm), image URL/base64
  async createAttendanceFromMobile(data: {
    sessionId: string;
    studentId: string;
    imageUrl?: string;
    imageBase64?: string;
    name?: string;
    timestamp?: string;
  }) {
    const schedule = await this.prisma.course_schedules.findFirst({
      where: { OR: [{ qrCode: data.sessionId }, { id: data.sessionId }] },
    });

    if (!schedule) {
      throw new NotFoundException('Session not found');
    }

    // prevent duplicate by (scheduleId, studentNpm)
    const existing = await this.prisma.attendances.findFirst({
      where: { scheduleId: schedule.id, studentNpm: data.studentId },
    });

    if (existing) {
      throw new BadRequestException('Attendance already submitted for this session');
    }

    // determine final image URL: either provided imageUrl or saved base64
    let finalImageUrl = data.imageUrl ?? null;
    if (!finalImageUrl && data.imageBase64) {
      finalImageUrl = await this.saveBase64Image(data.imageBase64);
    }

    if (!finalImageUrl) {
      throw new BadRequestException('Image is required');
    }

    const attendance = await this.prisma.attendances.create({
      data: {
        id: uuidv4(),
        scheduleId: schedule.id,
        studentName: data.name ?? data.studentId,
        studentNpm: data.studentId,
        selfieImage: finalImageUrl,
        scannedAt: data.timestamp ? new Date(data.timestamp) : new Date(),
        status: attendances_status.PENDING,
      },
    });

    return attendance;
  }

  // Save data:image/...;base64, return public uploads path
  private async saveBase64Image(base64: string): Promise<string> {
    const matches = base64.match(/^data:(.+);base64,(.+)$/);
    const mime = matches ? matches[1] : 'image/jpeg';
    const data = matches ? matches[2] : base64;
    const ext = mime.split('/')[1].split('+')[0] || 'jpg';
    const filename = `selfie-${uuidv4()}.${ext}`;
    const folder = path.join(process.cwd(), 'uploads', 'selfies');
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    const filepath = path.join(folder, filename);
    fs.writeFileSync(filepath, Buffer.from(data, 'base64'));
    // return URL path served by main.ts static assets
    return `/uploads/selfies/${filename}`;
  }

  // Student-facing: list own attendances. Accepts single id or array of possible identifiers
  async listAttendancesByStudent(identifiers: string | string[]) {
    const ids = Array.isArray(identifiers) ? identifiers.filter(Boolean) : [identifiers].filter(Boolean);
    if (!ids.length) return [];

    // Build OR conditions for exact and partial (contains) matches
    const orConditions: any[] = [];
    for (const id of ids) {
      orConditions.push({ studentNpm: { equals: id } });
      orConditions.push({ studentName: { equals: id } });
      orConditions.push({ studentNpm: { contains: id } });
      orConditions.push({ studentName: { contains: id } });
      // also try matching without domain part if this is an email
      if (id.includes('@')) {
        const local = id.split('@')[0];
        orConditions.push({ studentNpm: { contains: local } });
        orConditions.push({ studentName: { contains: local } });
      }
    }

    return this.prisma.attendances.findMany({
      where: { OR: orConditions },
      orderBy: { scannedAt: 'desc' },
    });
  }
}
