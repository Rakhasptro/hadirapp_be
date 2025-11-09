import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfileById(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      include: { students: true, teachers: true },
    });

    if (!user) return { message: 'User not found' };

    let profile: any = null;
    if (user.role === 'STUDENT') profile = user.students;
    if (user.role === 'TEACHER') profile = user.teachers;

    return {
      message: 'Profile loaded successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile,
      },
    };
  }

  async updateProfile(userId: string, updateData: any) {
    // Find user first
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      include: { students: true, teachers: true },
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

    // Update profile based on role
    if (user.role === 'TEACHER' && user.teachers) {
      const teacherData: any = {};
      if (updateData.name !== undefined) teacherData.name = updateData.name;
      if (updateData.nip !== undefined) teacherData.nip = updateData.nip;
      if (updateData.email !== undefined) teacherData.email = updateData.email;
      if (updateData.gender !== undefined) teacherData.gender = updateData.gender;
      if (updateData.phone !== undefined) teacherData.phone = updateData.phone;
      if (updateData.address !== undefined) teacherData.address = updateData.address;
      if (updateData.photo !== undefined) teacherData.photo = updateData.photo;

      if (Object.keys(teacherData).length > 0) {
        await this.prisma.teachers.update({
          where: { id: user.teachers.id },
          data: teacherData,
        });
      }
    } else if (user.role === 'STUDENT' && user.students) {
      const studentData: any = {};
      if (updateData.name !== undefined) studentData.name = updateData.name;
      if (updateData.nis !== undefined) studentData.nis = updateData.nis;
      if (updateData.phone !== undefined) studentData.phone = updateData.phone;
      if (updateData.address !== undefined) studentData.address = updateData.address;

      if (Object.keys(studentData).length > 0) {
        await this.prisma.students.update({
          where: { id: user.students.id },
          data: studentData,
        });
      }
    }

    // Return updated profile
    return this.getProfileById(userId);
  }
}
