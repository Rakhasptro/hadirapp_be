import { Controller, Get, Param, Post, Body, Patch, Delete, BadRequestException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { notifications_type } from '@prisma/client';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // 📩 Kirim notifikasi manual (misal dari admin)
  @Post('send')
  async sendNotification(
    @Body() body: {
      userId,
      type,
      title,
      message,
    }
  ) {
    if (!body.userId || !body.type || !body.title || !body.message) {
      throw new BadRequestException('UserId, type, title, dan message harus diisi');
    }

    return this.notificationsService.sendNotification(
      body.userId,
      body.type,
      body.title,
      body.message
    );
  }

  // 📬 Ambil notifikasi user
  @Get(':userId')
  getUserNotifications(@Param('userId') userId: string) {
    return this.notificationsService.getUserNotifications(userId);
  }

  // ✅ Tandai sebagai sudah dibaca
  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  // ❌ Hapus notifikasi
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.notificationsService.deleteNotification(id);
  }
}
