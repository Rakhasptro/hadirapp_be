import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { users_role } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(email: string, password: string, role?: string) {
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    if (typeof password !== 'string' || password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }

    const existingUser = await this.prisma.users.findUnique({ where: { email } });
    if (existingUser) throw new BadRequestException('Email already registered');

    const hashed = await bcrypt.hash(password, 10);

    // Determine role to create
    const normalizedRole = (role || '').toString().toUpperCase();
    const allowedRoles = ['TEACHER', 'STUDENT'];
    const roleValue = allowedRoles.includes(normalizedRole) ? (normalizedRole as users_role) : 'STUDENT';

    const user = await this.prisma.users.create({
      data: {
        id: uuidv4(),
        email,
        password: hashed,
        role: roleValue,
        updatedAt: new Date(),
      },
    });

    // If teacher was created, also auto-create teacher profile
    if (roleValue === 'TEACHER') {
      await this.prisma.teachers.create({
        data: {
          id: uuidv4(),
          userId: user.id,
          nip: `NIP-${Math.floor(Math.random() * 100000)}`,
          name: email.split('@')[0],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      return { message: 'Teacher registered successfully', user };
    }

    return { message: 'Student registered successfully', user };
  }

  async login(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const user = await this.prisma.users.findUnique({
      where: { email },
      include: { teachers: true },
    });
    if (!user) throw new UnauthorizedException('User not found');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
      teacherId: user.teachers?.id, 
    });

    return {
      message: 'Login success',
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.teachers,
      },
    };
  }

  async resetPassword(email?: string, npm?: string, newPassword?: string) {
    if (!email && !npm) {
      throw new BadRequestException('Email atau NPM harus diisi');
    }

    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException('Password baru minimal 6 karakter');
    }

    let userId: string | null = null;

    // Reset by email (for teacher)
    if (email) {
      const teacher = await this.prisma.teachers.findFirst({
        where: { email },
        include: { users: true },
      });

      if (!teacher) {
        throw new BadRequestException('Email tidak terdaftar sebagai teacher');
      }

      userId = teacher.users.id;
    }

    // Reset by NPM (for student)
    if (npm && !userId) {
      const student = await this.prisma.students.findUnique({
        where: { npm },
        include: { user: true },
      });

      if (!student) {
        throw new BadRequestException('NPM tidak terdaftar sebagai student');
      }

      userId = student.user.id;
    }

    if (!userId) {
      throw new BadRequestException('User tidak ditemukan');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.prisma.users.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    return {
      message: 'Password berhasil direset',
      success: true,
    };
  }
}
