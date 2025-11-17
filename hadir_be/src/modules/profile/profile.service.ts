import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfileById(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      include: { teachers: true },
    });

    if (!user) return { message: 'User not found' };

    return {
      message: 'Profile loaded successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.teachers,
      },
    };
  }

  async updateProfile(userId: string, updateData: any) {
    // Find user first
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      include: { teachers: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update email if provided
    if (updateData.email) {
      await this.prisma.users.update({
        where: { id: userId },
        data: { email: updateData.email },
      });
    }

    // Update teacher profile
    if (user.teachers) {
      const teacherData: any = {};
      if (updateData.name !== undefined) teacherData.name = updateData.name;
      if (updateData.nip !== undefined) teacherData.nip = updateData.nip;
      if (updateData.email !== undefined) teacherData.email = updateData.email;
      if (updateData.gender !== undefined) teacherData.gender = updateData.gender;
      if (updateData.phone !== undefined) teacherData.phone = updateData.phone;
      if (updateData.photo !== undefined) teacherData.photo = updateData.photo;
      if (updateData.address !== undefined) teacherData.address = updateData.address;

      if (Object.keys(teacherData).length > 0) {
        await this.prisma.teachers.update({
          where: { id: user.teachers.id },
          data: teacherData,
        });
      }
    }

    // Return updated profile
    return this.getProfileById(userId);
  }
}
