import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Sesuaikan path jika perlu
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService) {}

  // 1. CREATE
  async create(createTeacherDto: CreateTeacherDto) {
    // Memastikan userId dan nip belum terdaftar
    const existingTeacher = await this.prisma.teachers.findFirst({
        where: {
            OR: [
                { userId: createTeacherDto.userId },
                { nip: createTeacherDto.nip },
            ],
        },
    });

    if (existingTeacher) {
        throw new NotFoundException('User ID or NIP is already registered as a teacher.');
    }

    return this.prisma.teachers.create({
      data: {
            id: uuid(), // Menggunakan UUID dari aplikasi
            updatedAt: new Date(), // Wajib diisi jika tidak ada @updatedAt di skema
            ...createTeacherDto,
        },
  });  }

  // 2. READ ALL    
  findAll() {
    return this.prisma.teachers.findMany({
      select: {
        id: true,
        nip: true,
        name: true,
        phone: true,
        createdAt: true,
        users: { // Mengambil data user terkait
            select: { email: true, role: true }
        }
      }
    });
  }

  // 3. READ ONE
  async findOne(id: string) {
    const teacher = await this.prisma.teachers.findUnique({
      where: { id },
      include: {
        users: {
            select: { email: true, isActive: true }
        },
        course_schedules: true, // Menampilkan jadwal mengajar dengan course info
      }
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID "${id}" not found.`);
    }
    return teacher;
  }

  // 4. UPDATE
  async update(id: string, updateTeacherDto: UpdateTeacherDto) {
    try {
      return await this.prisma.teachers.update({
        where: { id },
        data: {
          ...updateTeacherDto,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      // Menangkap error jika ID tidak ditemukan
      if (error.code === 'P2025') {
        throw new NotFoundException(`Teacher with ID "${id}" not found.`);
      }
      throw error;
    }
  }

  // 5. DELETE
  async remove(id: string) {
    try {
      await this.prisma.teachers.delete({
        where: { id },
      });
      return { message: `Teacher with ID "${id}" successfully deleted.` };
    } catch (error) {
      // Menangkap error jika ID tidak ditemukan
      if (error.code === 'P2025') {
        throw new NotFoundException(`Teacher with ID "${id}" not found.`);
      }
      throw error;
    }
  }

  // 6. TEACHER DASHBOARD - Statistik untuk teacher
  async getTeacherDashboard(user: any) {
    // Ambil data teacher dari user (support both userId and id from JWT)
    const userIdToUse = user.userId || user.id;
    const teacher = await this.prisma.teachers.findUnique({
      where: { userId: userIdToUse },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher profile not found');
    }

    // Hitung statistik
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Total schedules
    const totalSchedules = await this.prisma.course_schedules.count({
      where: { teacherId: teacher.id },
    });

    // Schedules hari ini
    const todaySchedules = await this.prisma.course_schedules.count({
      where: {
        teacherId: teacher.id,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    // Total attendances pending
    const pendingAttendances = await this.prisma.attendances.count({
      where: {
        schedule: {
          teacherId: teacher.id,
        },
        status: 'PENDING',
      },
    });

    // Total attendances confirmed
    const confirmedAttendances = await this.prisma.attendances.count({
      where: {
        schedule: {
          teacherId: teacher.id,
        },
        status: 'CONFIRMED',
      },
    });

    return {
      teacherId: teacher.id,
      teacherName: teacher.name,
      totalSchedules,
      todaySchedules,
      pendingAttendances,
      confirmedAttendances,
    };
  }

  // 7. MY SCHEDULE - Jadwal mengajar teacher
  async getMySchedule(user: any) {
    const userIdToUse = user.userId || user.id;
    const teacher = await this.prisma.teachers.findUnique({
      where: { userId: userIdToUse },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher profile not found');
    }

    const schedules = await this.prisma.course_schedules.findMany({
      where: {
        teacherId: teacher.id,
      },
      orderBy: [
        { date: 'desc' },
        { startTime: 'asc' },
      ],
    });

    return schedules;
  }

  // 8. MY CLASSES - Simplified untuk schedule courses
  async getMyClasses(user: any) {
    const userIdToUse = user.userId || user.id;
    const teacher = await this.prisma.teachers.findUnique({
      where: { userId: userIdToUse },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher profile not found');
    }

    const schedules = await this.prisma.course_schedules.findMany({
      where: {
        teacherId: teacher.id,
      },
      include: {
        _count: {
          select: {
            attendances: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return schedules;
  }
}