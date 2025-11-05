import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { NotificationsService } from '../notifications/notifications.service';
import { notifications_type } from '@prisma/client';

@Injectable()
export class LeaveService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  // 🧑‍🎓 SISWA MENGAJUKAN IZIN
  async createLeave(data: any) {
    const { studentId, startDate, endDate, type, reason, attachment, userId } = data;

    if (!studentId || !startDate || !endDate || !type || !reason) {
      throw new BadRequestException('Semua field wajib diisi');
    }

    const student = await this.prisma.students.findUnique({
      where: { id: studentId },
    });
    if (!student) throw new NotFoundException('Siswa tidak ditemukan');

    const leave = await this.prisma.leave_requests.create({
      data: {
        id: uuidv4(),
        studentId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        type,
        reason,
        attachment: attachment || null,
        status: 'PENDING',
        updatedAt: new Date(),
      },
    });

    return { message: 'Pengajuan izin berhasil dibuat', leave };
  }

  // 📋 LIHAT SEMUA PENGAJUAN (ADMIN/GURU)
  async getAllLeaves() {
    return await this.prisma.leave_requests.findMany({
      include: {
        students: {
          include: { users: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 📋 LIHAT IZIN BERDASARKAN SISWA
  async getLeavesByStudent(studentId: string) {
    return await this.prisma.leave_requests.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 🧑‍🏫 GURU / ADMIN MENYETUJUI ATAU MENOLAK IZIN
  async reviewLeave(
    id: string,
    reviewerId: string,
    status: 'APPROVED' | 'REJECTED',
    notes?: string,
  ) {
    const leave = await this.prisma.leave_requests.findUnique({
      where: { id },
      include: {
        students: {
          include: { users: true },
        },
      },
    });

    if (!leave) throw new NotFoundException('Pengajuan izin tidak ditemukan');
    if (leave.status !== 'PENDING')
      throw new BadRequestException('Izin sudah direview sebelumnya');

    const oldValue = {
      status: leave.status,
      reviewedBy: leave.reviewedBy,
      reviewedAt: leave.reviewedAt,
      reviewNotes: leave.reviewNotes,
    };

    const updated = await this.prisma.leave_requests.update({
      where: { id },
      data: {
        status,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        reviewNotes: notes || null,
        updatedAt: new Date(),
      },
    });

    // 📨 Kirim notifikasi otomatis ke siswa
    const notifType =
      status === 'APPROVED'
        ? notifications_type.LEAVE_APPROVED
        : notifications_type.LEAVE_REJECTED;

    const title =
      status === 'APPROVED'
        ? 'Izin Disetujui ✅'
        : 'Izin Ditolak ❌';

    const message =
      status === 'APPROVED'
        ? `Pengajuan izin kamu (${leave.reason}) telah disetujui.`
        : `Pengajuan izin kamu (${leave.reason}) ditolak. Catatan: ${notes || '-'}`;

    // Pastikan userId siswa tersedia
    if (leave.students?.userId) {
      await this.notifications.sendNotification(
        leave.students.userId,
        notifType,
        title,
        message,
      );
    }

    return { message: `Izin telah ${status === 'APPROVED' ? 'disetujui' : 'ditolak'}`, updated };
  }

  // 🗑️ ADMIN MENGHAPUS IZIN
  async deleteLeave(id: string, userId: string) {
    const leave = await this.prisma.leave_requests.findUnique({ where: { id } });
    if (!leave) throw new NotFoundException('Pengajuan izin tidak ditemukan');
    await this.prisma.leave_requests.delete({ where: { id } });
    return { message: 'Pengajuan izin berhasil dihapus' };
  }
}
