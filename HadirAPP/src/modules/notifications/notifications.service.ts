import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { notifications_type } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  // 📩 Kirim notifikasi baru
  async sendNotification(
    userId: string,
    type: notifications_type,
    title: string,
    message: string,
  ) {
    try {
      const notif = await this.prisma.notifications.create({
        data: {
          id: uuidv4(),
          userId,
          type,
          title,
          message,
        },
      });

      return { message: 'Notifikasi dikirim', notif };
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  // 📬 Ambil semua notifikasi milik user
  async getUserNotifications(userId: string) {
    const notifications = await this.prisma.notifications.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return { count: notifications.length, notifications };
  }

  // ✅ Tandai notifikasi sudah dibaca
  async markAsRead(notificationId: string) {
    const notif = await this.prisma.notifications.findUnique({
      where: { id: notificationId },
    });

    if (!notif) throw new NotFoundException('Notifikasi tidak ditemukan');

    const updated = await this.prisma.notifications.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return { message: 'Notifikasi ditandai sebagai sudah dibaca', updated };
  }

  // ❌ Hapus notifikasi
  async deleteNotification(notificationId: string) {
    const notif = await this.prisma.notifications.findUnique({
      where: { id: notificationId },
    });

    if (!notif) throw new NotFoundException('Notifikasi tidak ditemukan');

    await this.prisma.notifications.delete({ where: { id: notificationId } });

    return { message: 'Notifikasi berhasil dihapus' };
  }
}
