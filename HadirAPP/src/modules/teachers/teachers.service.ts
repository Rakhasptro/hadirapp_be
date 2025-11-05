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
        courses: true, // Menampilkan mata pelajaran yang diajarkan
        schedules: true, // Menampilkan jadwal mengajar
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
    // Ambil data teacher dari user
    const teacher = await this.prisma.teachers.findUnique({
      where: { userId: user.id },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher profile not found');
    }

    // Hitung statistik
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));

    // Total kelas yang diampu (hitung unique classId)
    const uniqueClasses = await this.prisma.schedules.findMany({
      where: { teacherId: teacher.id },
      select: { classId: true },
      distinct: ['classId'],
    });
    const totalClasses = uniqueClasses.length;

    // Total mata pelajaran yang diajarkan
    const totalCourses = await this.prisma.courses.count({
      where: { teacherId: teacher.id },
    });

    // Total siswa dari semua kelas yang diampu
    const classesData = await this.prisma.schedules.findMany({
      where: { teacherId: teacher.id },
      include: {
        classes: {
          include: {
            students: true,
          },
        },
      },
      distinct: ['classId'],
    });

    const totalStudents = classesData.reduce((sum, schedule) => {
      return sum + (schedule.classes?.students?.length || 0);
    }, 0);

    // Sesi hari ini
    const todaySessions = await this.prisma.attendance_sessions.count({
      where: {
        teacherId: teacher.id,
        date: startOfDay,
      },
    });

    return {
      teacherId: teacher.id,
      teacherName: teacher.name,
      totalClasses,
      totalCourses,
      totalStudents,
      todaySessions,
    };
  }

  // 7. MY SCHEDULE - Jadwal mengajar teacher
  async getMySchedule(user: any) {
    const teacher = await this.prisma.teachers.findUnique({
      where: { userId: user.id },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher profile not found');
    }

    const schedules = await this.prisma.schedules.findMany({
      where: {
        teacherId: teacher.id,
        isActive: true,
      },
      include: {
        courses: true,
        classes: true,
        wifi_networks: true,
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });

    return schedules;
  }

  // 8. MY CLASSES - Kelas yang diampu teacher
  async getMyClasses(user: any) {
    const teacher = await this.prisma.teachers.findUnique({
      where: { userId: user.id },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher profile not found');
    }

    const schedules = await this.prisma.schedules.findMany({
      where: {
        teacherId: teacher.id,
        isActive: true,
      },
      include: {
        classes: {
          include: {
            students: true,
          },
        },
        courses: true,
      },
    });

    // Group by classId untuk menghindari duplikat
    const uniqueClasses = new Map();
    schedules.forEach(schedule => {
      if (schedule.classes && !uniqueClasses.has(schedule.classes.id)) {
        uniqueClasses.set(schedule.classes.id, schedule);
      }
    });

    return Array.from(uniqueClasses.values()).map(schedule => ({
      classId: schedule.classes?.id,
      className: schedule.classes?.name,
      grade: schedule.classes?.grade,
      major: schedule.classes?.major,
      totalStudents: schedule.classes?.students?.length || 0,
      course: {
        id: schedule.courses?.id,
        name: schedule.courses?.name,
        code: schedule.courses?.code,
      },
    }));
  }
}