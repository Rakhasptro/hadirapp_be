import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { schedules_dayOfWeek } from '@prisma/client';

@Injectable()
export class SchedulesService {
  constructor(private prisma: PrismaService) {}

  private getDayOfWeek(day: number): schedules_dayOfWeek {
    const days: schedules_dayOfWeek[] = [
      schedules_dayOfWeek.SUNDAY,
      schedules_dayOfWeek.MONDAY,
      schedules_dayOfWeek.TUESDAY,
      schedules_dayOfWeek.WEDNESDAY,
      schedules_dayOfWeek.THURSDAY,
      schedules_dayOfWeek.FRIDAY,
      schedules_dayOfWeek.SATURDAY,
    ];
    return days[day];
  }

  async getActiveSessions() {
    const now = new Date();
    const currentDayOfWeek = this.getDayOfWeek(now.getDay()); // Convert to enum value
    const currentTime = now.toTimeString().slice(0, 5); // Format: "HH:mm"

    console.log('🔍 Debug Info:');
    console.log('Current Day:', currentDayOfWeek);
    console.log('Current Time:', currentTime);
    console.log('Date:', now);

    const activeSessions = await this.prisma.schedules.findMany({
      where: {
        dayOfWeek: currentDayOfWeek,
        startTime: {
          lte: currentTime,
        },
        endTime: {
          gt: currentTime,
        },
        isActive: true,
      },
      include: {
        courses: true,
        teachers: {
          select: {
            id: true,
            name: true,
          }
        },
        classes: {
          include: {
            students: true,
          }
        },
        attendance_sessions: {
          where: {
            date: new Date(now.setHours(0, 0, 0, 0)),
          },
          include: {
            attendances: true,
          }
        }
      }
    });

    console.log('Found sessions:', activeSessions.length);

    return activeSessions;
  }

  // Method untuk debugging - lihat jadwal hari ini tanpa filter waktu
  async getTodaySchedules() {
    const now = new Date();
    const currentDayOfWeek = this.getDayOfWeek(now.getDay());

    const todaySchedules = await this.prisma.schedules.findMany({
      where: {
        dayOfWeek: currentDayOfWeek,
        isActive: true,
      },
      include: {
        courses: true,
        teachers: {
          select: {
            id: true,
            name: true,
          }
        },
        classes: {
          include: {
            students: true,
          }
        },
      },
      orderBy: {
        startTime: 'asc',
      }
    });

    return {
      day: currentDayOfWeek,
      currentTime: now.toTimeString().slice(0, 5),
      count: todaySchedules.length,
      schedules: todaySchedules,
    };
  }

  async createSchedule(data: any) {
    const { courseId, classId, teacherId, dayOfWeek, startTime, endTime, room, wifiNetworkId } = data;

    if (!courseId || !classId || !teacherId || !dayOfWeek || !startTime || !endTime) {
      throw new BadRequestException('Semua field wajib diisi');
    }

    // Validasi foreign key
    const [course, classes, teacher] = await Promise.all([
      this.prisma.courses.findUnique({ where: { id: courseId } }),
      this.prisma.classes.findUnique({ where: { id: classId } }),
      this.prisma.teachers.findUnique({ where: { id: teacherId } }),
    ]);

    if (!course) throw new NotFoundException('Mata pelajaran tidak ditemukan');
    if (!classes) throw new NotFoundException('Kelas tidak ditemukan');
    if (!teacher) throw new NotFoundException('Guru tidak ditemukan');

    const schedule = await this.prisma.schedules.create({
      data: {
        id: uuidv4(),
        courseId,
        classId,
        teacherId,
        dayOfWeek,
        startTime,
        endTime,
        room: room || null,
        wifiNetworkId: wifiNetworkId || null,
        isActive: true,
        updatedAt: new Date(),
      },
      include: {
        courses: true,
        teachers: true,
        classes: true,
      },
    });

    return { message: 'Jadwal berhasil dibuat', schedule };
  }

  async getAllSchedules() {
    return await this.prisma.schedules.findMany({
      include: {
        courses: true,
        teachers: true,
        classes: true,
        wifi_networks: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getScheduleById(id: string) {
    const schedule = await this.prisma.schedules.findUnique({
      where: { id },
      include: {
        courses: true,
        teachers: true,
        classes: true,
        wifi_networks: true,
      },
    });
    if (!schedule) throw new NotFoundException('Jadwal tidak ditemukan');
    return schedule;
  }

  async updateSchedule(id: string, data: any) {
    const existing = await this.prisma.schedules.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Jadwal tidak ditemukan');

    delete data.id; // biar aman
    const updated = await this.prisma.schedules.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });

    return { message: 'Jadwal berhasil diperbarui', updated };
  }

  async deleteSchedule(id: string) {
    const existing = await this.prisma.schedules.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Jadwal tidak ditemukan');

    await this.prisma.schedules.delete({ where: { id } });
    return { message: 'Jadwal berhasil dihapus' };
  }
}
