import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  // 🧑‍🏫 GURU MEMBUKA SESI ABSENSI
  async createSession(teacherId: string, scheduleId: string, description?: string) {
    try {
      if (!teacherId || !scheduleId) {
        throw new BadRequestException('TeacherId dan ScheduleId harus diisi');
      }

      // Pastikan jadwal ada
      const schedule = await this.prisma.schedules.findUnique({
        where: { id: scheduleId },
      });

      if (!schedule) {
        throw new NotFoundException('Jadwal tidak ditemukan');
      } else if (schedule.teacherId !== teacherId) {
        throw new BadRequestException('Anda tidak memiliki akses ke jadwal ini');
      }

      // Cek apakah sudah ada sesi aktif untuk jadwal ini
      const existingActiveSession = await this.prisma.attendance_sessions.findFirst({
        where: {
          scheduleId,
          endTime: null, // ✅ null menandakan sesi masih aktif
        },
      });

      if (existingActiveSession) {
        throw new BadRequestException('Sudah ada sesi absensi yang aktif untuk jadwal ini');
      }

      // Buat sesi absensi baru
      const session = await this.prisma.attendance_sessions.create({
        data: {
          id: uuidv4(),
          scheduleId,
          teacherId,
          date: new Date(),
          startTime: new Date(),
          endTime: null, // ✅ jangan undefined
          status: 'OPEN',
          description: description || null,
          topic: 'Pertemuan ' + new Date().toLocaleDateString('id-ID'),
          notes: null,
          qrCode: null,
          qrExpiredAt: null,
          isActive: true,
          updatedAt: new Date(),
        },
      });

      return { message: '✅ Sesi absensi berhasil dibuka', session };
    } catch (error) {
      console.error('Error creating session:', JSON.stringify(error, null, 2));
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Gagal membuka sesi absensi');
    }
  }

  // 🎓 SISWA MELAKUKAN ABSENSI
  async markAttendance(studentId: string, sessionId: string, status: string = 'PRESENT') {
    try {
      if (!studentId || !sessionId) {
        throw new BadRequestException('StudentId dan SessionId harus diisi');
      }

      if (!['PRESENT', 'ABSENT', 'LATE'].includes(status)) {
        throw new BadRequestException('Status tidak valid. Gunakan: PRESENT, ABSENT, atau LATE');
      }

      // Cek sesi absensi
      const session = await this.prisma.attendance_sessions.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        throw new NotFoundException('Sesi absensi tidak ditemukan');
      } else if (session.endTime) {
        throw new BadRequestException('Sesi absensi sudah ditutup');
      }

      // Cek apakah student ada
      const student = await this.prisma.students.findUnique({
        where: { id: studentId },
      });
      if (!student) throw new NotFoundException('Student not found');

      // Cek apakah sudah absen
      const existing = await this.prisma.attendances.findFirst({
        where: { studentId, sessionId },
      });
      if (existing) throw new BadRequestException('Kamu sudah absen di sesi ini');

      // Simpan absensi baru
      const attendance = await this.prisma.attendances.create({
        data: {
          id: uuidv4(),
          studentId,
          sessionId,
          status,
          checkInTime: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return { message: '✅ Absensi berhasil', attendance };
    } catch (error) {
      console.error('Error marking attendance:', JSON.stringify(error, null, 2));
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Gagal melakukan absensi');
    }
  }

  // 📋 MELIHAT LAPORAN ABSENSI
  async getSessionAttendance(sessionId: string) {
    try {
      const session = await this.prisma.attendance_sessions.findUnique({
        where: { id: sessionId },
        include: {
          attendances: {
            include: {
              students: {
                include: { users: true },
              },
            },
          },
          schedules: true,
        },
      });

      if (!session) throw new NotFoundException('Session not found');

      return {
        sessionId: session.id,
        teacherId: session.teacherId,
        schedule: session.schedules,
        status: session.status,
        startTime: session.startTime,
        endTime: session.endTime,
        description: session.description,
        topic: session.topic,
        totalAttendance: session.attendances.length,
        data: session.attendances.map((a) => ({
          studentId: a.students.id,
          studentName: a.students.name,
          status: a.status,
          checkInTime: a.checkInTime,
        })),
      };
    } catch (error) {
      console.error('Error getting session attendance:', JSON.stringify(error, null, 2));
      throw new BadRequestException('Gagal mengambil data absensi');
    }
  }

  // 🚪 ADMIN / GURU MENUTUP SESI
  async closeSession(sessionId: string) {
    try {
      const session = await this.prisma.attendance_sessions.findUnique({
        where: { id: sessionId },
      });

      if (!session) throw new NotFoundException('Sesi absensi tidak ditemukan');
      if (session.endTime) throw new BadRequestException('Sesi absensi sudah ditutup sebelumnya');

      const updatedSession = await this.prisma.attendance_sessions.update({
        where: { id: sessionId },
        data: {
          endTime: new Date(),
          status: 'CLOSED',
          updatedAt: new Date(),
        },
      });

      return { message: '✅ Sesi absensi berhasil ditutup', session: updatedSession };
    } catch (error) {
      console.error('Error closing session:', JSON.stringify(error, null, 2));
      throw new BadRequestException('Gagal menutup sesi absensi');
    }
  }
}
