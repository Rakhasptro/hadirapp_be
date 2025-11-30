import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfileById(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      include: { teachers: true, students: true },
    });

    if (!user) return { message: 'User not found' };

    const profileData: any = {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: null,
    };

    if (user.role === 'TEACHER' && user.teachers) {
      profileData.profile = user.teachers;
    }

    if (user.role === 'STUDENT' && user.students) {
      profileData.profile = user.students;
    }

    return {
      message: 'Profile loaded successfully',
      user: profileData,
    };
  }

  async updateProfile(userId: string, updateData: any) {
    // Find user first
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      include: { teachers: true, students: true },
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

    // Update or create student profile
    if (user.role === 'STUDENT') {
      // If student row exists, update it
      if (user.students) {
        const studentData: any = {};
        if (updateData.fullName !== undefined) studentData.fullName = updateData.fullName;
        if (updateData.npm !== undefined) studentData.npm = updateData.npm;
        if (Object.keys(studentData).length > 0) {
          try {
            await this.prisma.students.update({
              where: { userId: userId },
              data: studentData,
            });
          } catch (err) {
            if ((err as any)?.code === 'P2002') {
              // Unique constraint failed (e.g., npm)
              throw new BadRequestException('Unique constraint failed when updating student (duplicate field)');
            }
            throw err;
          }
        }
      } else {
        // Create a student record if provided data includes required fields
        if (updateData.fullName && updateData.npm) {
          try {
            await this.prisma.students.create({
              data: {
                userId: userId,
                fullName: updateData.fullName,
                npm: updateData.npm,
              },
            });
          } catch (err) {
            if ((err as any)?.code === 'P2002') {
              // Unique constraint failed
              throw new BadRequestException('Could not create student: npm or userId already exists');
            }
            throw err;
          }
        }
      }
    }

    // Return updated profile
    return this.getProfileById(userId);
  }
}
