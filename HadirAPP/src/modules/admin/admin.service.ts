import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // 📊 Statistik Cepat
  async getDashboardStats() {
    const totalStudents = await this.prisma.students.count();
    const totalTeachers = await this.prisma.teachers.count();
    const totalClasses = await this.prisma.classes.count();
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));

    const attendanceToday = await this.prisma.attendances.count({
      where: { checkInTime: { gte: startOfDay } },
    });

    return {
      totalStudents,
      totalTeachers,
      totalClasses,
      attendanceToday,
    };
  }

  // 📊 Statistik Kehadiran Hari Ini
  async getTodayAttendanceStats() {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const totalStudents = await this.prisma.students.count();

    // Hitung berdasarkan status
    const [present, late, absent] = await Promise.all([
      this.prisma.attendances.count({
        where: {
          checkInTime: { gte: startOfDay, lte: endOfDay },
          status: 'PRESENT',
        },
      }),
      this.prisma.attendances.count({
        where: {
          checkInTime: { gte: startOfDay, lte: endOfDay },
          status: 'LATE',
        },
      }),
      // Siswa yang tidak hadir = total siswa - (hadir + terlambat)
      // Atau hitung dari status ABSENT/EXCUSED/SICK
      this.prisma.attendances.count({
        where: {
          checkInTime: { gte: startOfDay, lte: endOfDay },
          status: { in: ['ABSENT', 'EXCUSED', 'SICK'] },
        },
      }),
    ]);

    return {
      total: totalStudents,
      present,
      late,
      absent: totalStudents - present - late, // Siswa yang belum absen sama sekali
    };
  }

  // 📈 Data Grafik Kehadiran Mingguan
  async getWeeklyAttendanceChart() {
    const today = new Date();
    const weekData: Array<{
      date: string;
      present: number;
      late: number;
      absent: number;
    }> = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const [present, late, absent] = await Promise.all([
        this.prisma.attendances.count({
          where: {
            checkInTime: { gte: startOfDay, lte: endOfDay },
            status: 'PRESENT',
          },
        }),
        this.prisma.attendances.count({
          where: {
            checkInTime: { gte: startOfDay, lte: endOfDay },
            status: 'LATE',
          },
        }),
        this.prisma.attendances.count({
          where: {
            checkInTime: { gte: startOfDay, lte: endOfDay },
            status: { in: ['ABSENT', 'EXCUSED', 'SICK'] },
          },
        }),
      ]);

      weekData.push({
        date: date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
        present,
        late,
        absent,
      });
    }

    return weekData;
  }

  // 📈 Data Grafik Kehadiran Bulanan (30 hari terakhir)
  async getMonthlyAttendanceChart() {
    const today = new Date();
    const monthData: Array<{
      date: string;
      present: number;
      late: number;
      absent: number;
    }> = [];

    // Ambil 6 titik data (setiap 5 hari)
    for (let i = 30; i >= 0; i -= 5) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const startRange = new Date(date.setHours(0, 0, 0, 0));
      const endRange = new Date(date);
      endRange.setDate(endRange.getDate() + 5);
      endRange.setHours(23, 59, 59, 999);

      const [present, late, absent] = await Promise.all([
        this.prisma.attendances.count({
          where: {
            checkInTime: { gte: startRange, lte: endRange },
            status: 'PRESENT',
          },
        }),
        this.prisma.attendances.count({
          where: {
            checkInTime: { gte: startRange, lte: endRange },
            status: 'LATE',
          },
        }),
        this.prisma.attendances.count({
          where: {
            checkInTime: { gte: startRange, lte: endRange },
            status: { in: ['ABSENT', 'EXCUSED', 'SICK'] },
          },
        }),
      ]);

      monthData.push({
        date: startRange.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
        present,
        late,
        absent,
      });
    }

    return monthData;
  }

  // 👥 Daftar Semua User
  async getAllUsers(role?: string, isActive?: string) {
    const where: any = {};
    
    if (role) {
      where.role = role;
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    return this.prisma.users.findMany({
      where,
      include: {
        students: {
          select: {
            id: true,
            name: true,
            nis: true,
            classId: true,
            classes: {
              select: {
                name: true,
              },
            },
          },
        },
        teachers: {
          select: {
            id: true,
            name: true,
            nip: true,
            email: true,
            gender: true,
            phone: true,
            address: true,
            photo: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // 📊 Statistik Users
  async getUsersStats() {
    const [total, admins, teachers, students, active, inactive] = await Promise.all([
      this.prisma.users.count(),
      this.prisma.users.count({ where: { role: 'ADMIN' } }),
      this.prisma.users.count({ where: { role: 'TEACHER' } }),
      this.prisma.users.count({ where: { role: 'STUDENT' } }),
      this.prisma.users.count({ where: { isActive: true } }),
      this.prisma.users.count({ where: { isActive: false } }),
    ]);

    return {
      total,
      byRole: {
        admins,
        teachers,
        students,
      },
      byStatus: {
        active,
        inactive,
      },
    };
  }

  // 👤 Get User By ID
  async getUserById(id: string) {
    const user = await this.prisma.users.findUnique({
      where: { id },
      include: {
        students: {
          include: {
            classes: true,
          },
        },
        teachers: true,
      },
    });

    if (!user) {
      throw new Error('User tidak ditemukan');
    }

    // Don't send password to client
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // ➕ Create User
  async createUser(data: any) {
    const { email, password, role, name, nis, nip, classId, phone, address, gender, photo } = data;

    // Validasi
    if (!email || !password || !role) {
      throw new Error('Email, password, dan role harus diisi');
    }

    // Check if email already exists
    const existingUser = await this.prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('Email sudah digunakan');
    }

    // Hash password
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.users.create({
      data: {
        id: this.generateId(),
        email,
        password: hashedPassword,
        role,
        isActive: true,
        updatedAt: new Date(),
      },
    });

    // Create related profile based on role
    if (role === 'STUDENT' && name && nis) {
      await this.prisma.students.create({
        data: {
          id: this.generateId(),
          userId: user.id,
          nis,
          name,
          phone: phone || null,
          address: address || null,
          classId: classId || null,
          updatedAt: new Date(),
        },
      });
    } else if (role === 'TEACHER' && name && nip) {
      await this.prisma.teachers.create({
        data: {
          id: this.generateId(),
          userId: user.id,
          nip,
          name,
          email: email || null,
          gender: gender || null,
          phone: phone || null,
          address: address || null,
          photo: photo || null,
          updatedAt: new Date(),
        },
      });
    }

    return { message: 'User berhasil dibuat', userId: user.id };
  }

  // ✏️ Update User
  async updateUser(id: string, data: any) {
    const user = await this.prisma.users.findUnique({
      where: { id },
      include: {
        students: true,
        teachers: true,
      },
    });

    if (!user) {
      throw new Error('User tidak ditemukan');
    }

    const {
      email,
      role,
      name,
      nis,
      nip,
      classId,
      phone,
      address,
      gender,
      photo,
    } = data;

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await this.prisma.users.findUnique({
        where: { email },
      });
      if (existingUser) {
        throw new Error('Email sudah digunakan');
      }
    }

    // Update user
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (email) updateData.email = email;
    if (role) updateData.role = role;

    await this.prisma.users.update({
      where: { id },
      data: updateData,
    });

    // Update related profile
    if (user.students && name !== undefined) {
      const studentUpdate: any = {
        updatedAt: new Date(),
      };
      if (name) studentUpdate.name = name;
      if (nis) studentUpdate.nis = nis;
      if (classId !== undefined) studentUpdate.classId = classId;
      if (phone !== undefined) studentUpdate.phone = phone;
      if (address !== undefined) studentUpdate.address = address;

      await this.prisma.students.update({
        where: { id: user.students.id },
        data: studentUpdate,
      });
    } else if (user.teachers && name !== undefined) {
      const teacherUpdate: any = {
        updatedAt: new Date(),
      };
      if (name) teacherUpdate.name = name;
      if (nip) teacherUpdate.nip = nip;
      if (email !== undefined) teacherUpdate.email = email;
      if (gender !== undefined) teacherUpdate.gender = gender;
      if (phone !== undefined) teacherUpdate.phone = phone;
      if (address !== undefined) teacherUpdate.address = address;
      if (photo !== undefined) teacherUpdate.photo = photo;

      await this.prisma.teachers.update({
        where: { id: user.teachers.id },
        data: teacherUpdate,
      });
    }

    return { message: 'User berhasil diperbarui' };
  }

  // 🔄 Toggle User Status
  async toggleUserStatus(id: string) {
    const user = await this.prisma.users.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error('User tidak ditemukan');
    }

    const updated = await this.prisma.users.update({
      where: { id },
      data: {
        isActive: !user.isActive,
        updatedAt: new Date(),
      },
    });

    return {
      message: `User ${updated.isActive ? 'diaktifkan' : 'dinonaktifkan'}`,
      isActive: updated.isActive,
    };
  }

  // 🔑 Reset Password
  async resetPassword(id: string, newPassword: string) {
    const user = await this.prisma.users.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error('User tidak ditemukan');
    }

    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password minimal 6 karakter');
    }

    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.users.update({
      where: { id },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    return { message: 'Password berhasil direset' };
  }

  // 🗑️ Delete User
  async deleteUser(id: string) {
    const user = await this.prisma.users.findUnique({
      where: { id },
      include: {
        students: {
          include: {
            attendances: true,
            leave_requests: true,
          },
        },
        teachers: {
          include: {
            schedules: true,
            courses: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User tidak ditemukan');
    }

    // Check if user has related data
    if (user.students) {
      if (user.students.attendances.length > 0) {
        throw new Error(
          'Tidak dapat menghapus user yang memiliki riwayat kehadiran. Nonaktifkan user sebagai gantinya.',
        );
      }
      if (user.students.leave_requests.length > 0) {
        throw new Error(
          'Tidak dapat menghapus user yang memiliki riwayat izin. Nonaktifkan user sebagai gantinya.',
        );
      }
    }

    if (user.teachers) {
      if (user.teachers.schedules.length > 0 || user.teachers.courses.length > 0) {
        throw new Error(
          'Tidak dapat menghapus guru yang memiliki jadwal atau mata pelajaran. Nonaktifkan user sebagai gantinya.',
        );
      }
    }

    // Safe to delete
    await this.prisma.users.delete({
      where: { id },
    });

    return { message: 'User berhasil dihapus' };
  }

  // ==================== CLASSES MANAGEMENT ====================

  // 🏫 Daftar Semua Kelas dengan Filter
  async getAllClasses(semester?: string, courseId?: string) {
    const where: any = {};
    if (semester) where.semester = semester;
    if (courseId) where.courseId = courseId;

    return this.prisma.classes.findMany({
      where,
      include: {
        courses: {
          select: {
            id: true,
            code: true,
            name: true,
            credits: true,
          },
        },
        students: {
          select: {
            id: true,
            name: true,
            nis: true,
          },
        },
        _count: {
          select: {
            students: true,
            schedules: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  // 📊 Statistik Kelas
  async getClassesStats() {
    const classes = await this.prisma.classes.findMany({
      include: {
        courses: {
          select: {
            code: true,
            name: true,
          },
        },
        _count: {
          select: { students: true },
        },
      },
    });

    const totalClasses = classes.length;
    const totalStudents = classes.reduce((sum, cls) => sum + cls._count.students, 0);
    const avgStudentsPerClass = totalClasses > 0 ? Math.round(totalStudents / totalClasses) : 0;

    // Group by semester
    const bySemester = classes.reduce((acc, cls) => {
      acc[cls.semester] = (acc[cls.semester] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by course
    const byCourse = classes.reduce((acc, cls) => {
      const courseName = cls.courses?.name || 'Tidak ada mata kuliah';
      acc[courseName] = (acc[courseName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: totalClasses,
      totalStudents,
      avgStudentsPerClass,
      bySemester,
      byCourse,
      classes: classes.map((cls) => ({
        id: cls.id,
        name: cls.name,
        semester: cls.semester,
        courseCode: cls.courses?.code,
        courseName: cls.courses?.name,
        capacity: cls.capacity,
        studentCount: cls._count.students,
        utilization: cls.capacity ? Math.round((cls._count.students / cls.capacity) * 100) : 0,
      })),
    };
  }

  // 🔍 Detail Kelas by ID
  async getClassById(id: string) {
    const cls = await this.prisma.classes.findUnique({
      where: { id },
      include: {
        courses: {
          select: {
            id: true,
            code: true,
            name: true,
            credits: true,
            description: true,
          },
        },
        students: {
          include: {
            users: {
              select: {
                email: true,
                isActive: true,
              },
            },
          },
        },
        schedules: {
          include: {
            courses: true,
            teachers: {
              include: {
                users: {
                  select: {
                    email: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            students: true,
            schedules: true,
          },
        },
      },
    });

    if (!cls) {
      throw new NotFoundException('Kelas tidak ditemukan');
    }

    return cls;
  }

  // ➕ Tambah Kelas Baru
  async createClass(data: {
    courseId: string;
    semester: string;
    capacity?: number;
  }) {
    // Validasi apakah course ada
    const course = await this.prisma.courses.findUnique({
      where: { id: data.courseId },
    });

    if (!course) {
      throw new NotFoundException('Mata kuliah tidak ditemukan');
    }

    // Nama kelas otomatis dari kode mata kuliah
    const className = course.code;

    // Validasi nama kelas unik
    const existing = await this.prisma.classes.findUnique({
      where: { name: className },
    });

    if (existing) {
      throw new BadRequestException(`Kelas dengan nama ${className} sudah ada`);
    }

    return this.prisma.classes.create({
      data: {
        id: require('uuid').v4(),
        name: className,
        semester: data.semester,
        courseId: data.courseId,
        capacity: data.capacity || 40,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        courses: {
          select: {
            id: true,
            code: true,
            name: true,
            credits: true,
          },
        },
        _count: {
          select: {
            students: true,
            schedules: true,
          },
        },
      },
    });
  }

  // ✏️ Update Kelas
  async updateClass(
    id: string,
    data: {
      courseId?: string;
      semester?: string;
      capacity?: number;
    },
  ) {
    const cls = await this.prisma.classes.findUnique({ 
      where: { id },
      include: {
        courses: true,
      },
    });

    if (!cls) {
      throw new NotFoundException('Kelas tidak ditemukan');
    }

    // Jika courseId diubah, validasi dan update nama kelas
    let updateData: any = {
      updatedAt: new Date(),
    };

    if (data.courseId && data.courseId !== cls.courseId) {
      const course = await this.prisma.courses.findUnique({
        where: { id: data.courseId },
      });

      if (!course) {
        throw new NotFoundException('Mata kuliah tidak ditemukan');
      }

      const newClassName = course.code;

      // Validasi nama kelas baru tidak duplikat
      const existing = await this.prisma.classes.findUnique({
        where: { name: newClassName },
      });

      if (existing && existing.id !== id) {
        throw new BadRequestException(`Kelas dengan nama ${newClassName} sudah ada`);
      }

      updateData.name = newClassName;
      updateData.courseId = data.courseId;
    }

    if (data.semester) {
      updateData.semester = data.semester;
    }

    if (data.capacity !== undefined) {
      updateData.capacity = data.capacity;
    }

    return this.prisma.classes.update({
      where: { id },
      data: updateData,
      include: {
        courses: {
          select: {
            id: true,
            code: true,
            name: true,
            credits: true,
          },
        },
        _count: {
          select: {
            students: true,
            schedules: true,
          },
        },
      },
    });
  }

  // ❌ Hapus Kelas
  async deleteClass(id: string) {
    const cls = await this.prisma.classes.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            students: true,
            schedules: true,
          },
        },
      },
    });

    if (!cls) {
      throw new NotFoundException('Kelas tidak ditemukan');
    }

    // Validasi: tidak boleh hapus jika masih ada siswa
    if (cls._count.students > 0) {
      throw new BadRequestException(
        `Tidak dapat menghapus kelas. Masih ada ${cls._count.students} siswa di kelas ini`,
      );
    }

    // Validasi: tidak boleh hapus jika masih ada jadwal
    if (cls._count.schedules > 0) {
      throw new BadRequestException(
        `Tidak dapat menghapus kelas. Masih ada ${cls._count.schedules} jadwal terkait`,
      );
    }

    await this.prisma.classes.delete({ where: { id } });

    return { message: 'Kelas berhasil dihapus' };
  }

  // ==================== OTHER SERVICES ====================

  // 📋 Laporan Absensi
  async getAttendanceReport(classId?: string) {
    const filter = classId ? { students: { classId } } : {};
    const attendances = await this.prisma.attendances.findMany({
      where: filter,
      include: {
        students: {
          include: { users: true },
        },
      },
      orderBy: { checkInTime: 'desc' },
    });

    return attendances.map((a) => ({
      student: a.students.name,
      email: a.students.users.email,
      status: a.status,
      class: a.students.classId,
      subject: (a as any).sessionId ?? null,
      date: a.checkInTime,
    }));
  }

  // 📋 Daftar Semua Sesi Absensi
  async getAttendanceSessions(filters?: {
    classId?: string;
    teacherId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.date.lte = new Date(filters.endDate);
      }
    }

    if (filters?.teacherId) {
      where.schedules = {
        teacherId: filters.teacherId,
      };
    }

    if (filters?.classId) {
      where.schedules = {
        classId: filters.classId,
      };
    }

    const sessions = await this.prisma.attendance_sessions.findMany({
      where,
      include: {
        schedules: {
          include: {
            courses: true,
            classes: {
              include: {
                students: true,
              },
            },
            teachers: {
              include: {
                users: true,
              },
            },
          },
        },
        attendances: true,
      },
      orderBy: { date: 'desc' },
    });

    return sessions.map((session) => {
      const totalStudents = session.schedules.classes.students?.length || 0;
      const present = session.attendances.filter((a) => a.status === 'PRESENT').length;
      const late = session.attendances.filter((a) => a.status === 'LATE').length;
      const absent = totalStudents - present - late;

      return {
        id: session.id,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        status: session.status,
        description: session.description,
        topic: session.topic,
        course: session.schedules.courses.name,
        class: session.schedules.classes.name,
        teacher: session.schedules.teachers.name,
        teacherEmail: session.schedules.teachers.users.email,
        totalStudents,
        present,
        late,
        absent,
        attendanceCount: session.attendances.length,
      };
    });
  }

  // 👁️ Detail Sesi Absensi
  async getSessionDetail(sessionId: string) {
    const session = await this.prisma.attendance_sessions.findUnique({
      where: { id: sessionId },
      include: {
        schedules: {
          include: {
            courses: true,
            classes: {
              include: {
                students: {
                  include: {
                    users: true,
                  },
                },
              },
            },
            teachers: {
              include: {
                users: true,
              },
            },
          },
        },
        attendances: {
          include: {
            students: {
              include: {
                users: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    const allStudents = session.schedules.classes.students;
    const attendanceMap = new Map(
      session.attendances.map((a) => [a.studentId, a]),
    );

    const studentList = allStudents.map((student) => {
      const attendance = attendanceMap.get(student.id);
      return {
        id: student.id,
        name: student.name,
        email: student.users.email,
        nis: student.nis,
        status: attendance?.status || 'ABSENT',
        checkInTime: attendance?.checkInTime || null,
        notes: attendance?.notes || null,
      };
    });

    return {
      id: session.id,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      status: session.status,
      description: session.description,
      topic: session.topic,
      notes: session.notes,
      course: session.schedules.courses.name,
      class: session.schedules.classes.name,
      teacher: session.schedules.teachers.name,
      teacherEmail: session.schedules.teachers.users.email,
      totalStudents: allStudents.length,
      present: session.attendances.filter((a) => a.status === 'PRESENT').length,
      late: session.attendances.filter((a) => a.status === 'LATE').length,
      absent: allStudents.length - session.attendances.length,
      students: studentList,
    };
  }

  // 📅 Schedule Management
  async getAllSchedules(filters?: {
    classId?: string;
    teacherId?: string;
    dayOfWeek?: string;
  }) {
    const where: any = {};

    if (filters?.classId) where.classId = filters.classId;
    if (filters?.teacherId) where.teacherId = filters.teacherId;
    if (filters?.dayOfWeek) where.dayOfWeek = filters.dayOfWeek;

    const schedules = await this.prisma.schedules.findMany({
      where,
      include: {
        courses: true,
        teachers: {
          select: {
            id: true,
            name: true,
            nip: true,
          },
        },
        classes: {
          select: {
            id: true,
            name: true,
            semester: true,
            courses: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        },
        wifi_networks: {
          select: {
            id: true,
            ssid: true,
          },
        },
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });

    return schedules;
  }

  async getScheduleById(id: string) {
    const schedule = await this.prisma.schedules.findUnique({
      where: { id },
      include: {
        courses: true,
        teachers: {
          select: {
            id: true,
            name: true,
            nip: true,
            phone: true,
          },
        },
        classes: {
          include: {
            students: {
              select: {
                id: true,
                name: true,
                nis: true,
              },
            },
          },
        },
        wifi_networks: true,
      },
    });

    if (!schedule) {
      throw new Error('Jadwal tidak ditemukan');
    }

    return schedule;
  }

  async createSchedule(data: any) {
    const {
      courseId,
      classId,
      teacherId,
      dayOfWeek,
      startTime,
      endTime,
      room,
      wifiNetworkId,
    } = data;

    // Validasi field wajib
    if (!courseId || !classId || !teacherId || !dayOfWeek || !startTime || !endTime) {
      throw new Error('Semua field wajib diisi');
    }

    // Validasi foreign key
    const [course, classes, teacher] = await Promise.all([
      this.prisma.courses.findUnique({ where: { id: courseId } }),
      this.prisma.classes.findUnique({ where: { id: classId } }),
      this.prisma.teachers.findUnique({ where: { id: teacherId } }),
    ]);

    if (!course) throw new Error('Mata pelajaran tidak ditemukan');
    if (!classes) throw new Error('Kelas tidak ditemukan');
    if (!teacher) throw new Error('Guru tidak ditemukan');

    // Check for schedule conflicts
    const conflictingSchedule = await this.prisma.schedules.findFirst({
      where: {
        OR: [
          // Konflik untuk teacher yang sama
          {
            teacherId,
            dayOfWeek,
            isActive: true,
            OR: [
              {
                AND: [
                  { startTime: { lte: startTime } },
                  { endTime: { gt: startTime } },
                ],
              },
              {
                AND: [
                  { startTime: { lt: endTime } },
                  { endTime: { gte: endTime } },
                ],
              },
              {
                AND: [
                  { startTime: { gte: startTime } },
                  { endTime: { lte: endTime } },
                ],
              },
            ],
          },
          // Konflik untuk kelas yang sama
          {
            classId,
            dayOfWeek,
            isActive: true,
            OR: [
              {
                AND: [
                  { startTime: { lte: startTime } },
                  { endTime: { gt: startTime } },
                ],
              },
              {
                AND: [
                  { startTime: { lt: endTime } },
                  { endTime: { gte: endTime } },
                ],
              },
              {
                AND: [
                  { startTime: { gte: startTime } },
                  { endTime: { lte: endTime } },
                ],
              },
            ],
          },
        ],
      },
      include: {
        teachers: { select: { name: true } },
        classes: { select: { name: true } },
      },
    });

    if (conflictingSchedule) {
      throw new Error(
        `Jadwal bertabrakan dengan jadwal lain: ${conflictingSchedule.teachers.name} atau kelas ${conflictingSchedule.classes.name} pada ${conflictingSchedule.dayOfWeek} ${conflictingSchedule.startTime}-${conflictingSchedule.endTime}`,
      );
    }

    const schedule = await this.prisma.schedules.create({
      data: {
        id: this.generateId(),
        courseId,
        classId,
        teacherId,
        dayOfWeek,
        startTime,
        endTime,
        room: room || null,
        wifiNetworkId: wifiNetworkId || null,
        isActive: true,
        updatedAt: new Date(),
      },
      include: {
        courses: true,
        teachers: true,
        classes: true,
        wifi_networks: true,
      },
    });

    return { message: 'Jadwal berhasil dibuat', schedule };
  }

  async updateSchedule(id: string, data: any) {
    const existing = await this.prisma.schedules.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Jadwal tidak ditemukan');
    }

    // Jika ada perubahan waktu, cek konflik
    if (data.dayOfWeek || data.startTime || data.endTime || data.teacherId || data.classId) {
      const dayOfWeek = data.dayOfWeek || existing.dayOfWeek;
      const startTime = data.startTime || existing.startTime;
      const endTime = data.endTime || existing.endTime;
      const teacherId = data.teacherId || existing.teacherId;
      const classId = data.classId || existing.classId;

      const conflictingSchedule = await this.prisma.schedules.findFirst({
        where: {
          id: { not: id }, // Exclude current schedule
          OR: [
            {
              teacherId,
              dayOfWeek,
              isActive: true,
              OR: [
                {
                  AND: [
                    { startTime: { lte: startTime } },
                    { endTime: { gt: startTime } },
                  ],
                },
                {
                  AND: [
                    { startTime: { lt: endTime } },
                    { endTime: { gte: endTime } },
                  ],
                },
                {
                  AND: [
                    { startTime: { gte: startTime } },
                    { endTime: { lte: endTime } },
                  ],
                },
              ],
            },
            {
              classId,
              dayOfWeek,
              isActive: true,
              OR: [
                {
                  AND: [
                    { startTime: { lte: startTime } },
                    { endTime: { gt: startTime } },
                  ],
                },
                {
                  AND: [
                    { startTime: { lt: endTime } },
                    { endTime: { gte: endTime } },
                  ],
                },
                {
                  AND: [
                    { startTime: { gte: startTime } },
                    { endTime: { lte: endTime } },
                  ],
                },
              ],
            },
          ],
        },
        include: {
          teachers: { select: { name: true } },
          classes: { select: { name: true } },
        },
      });

      if (conflictingSchedule) {
        throw new Error(
          `Jadwal bertabrakan dengan jadwal lain: ${conflictingSchedule.teachers.name} atau kelas ${conflictingSchedule.classes.name}`,
        );
      }
    }

    delete data.id;
    const updated = await this.prisma.schedules.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
      include: {
        courses: true,
        teachers: true,
        classes: true,
        wifi_networks: true,
      },
    });

    return { message: 'Jadwal berhasil diperbarui', schedule: updated };
  }

  async deleteSchedule(id: string) {
    const existing = await this.prisma.schedules.findUnique({
      where: { id },
      include: {
        attendance_sessions: true,
      },
    });

    if (!existing) {
      throw new Error('Jadwal tidak ditemukan');
    }

    // Check if there are any attendance sessions
    if (existing.attendance_sessions.length > 0) {
      throw new Error(
        'Tidak dapat menghapus jadwal yang memiliki riwayat kehadiran. Nonaktifkan jadwal sebagai gantinya.',
      );
    }

    await this.prisma.schedules.delete({ where: { id } });
    return { message: 'Jadwal berhasil dihapus' };
  }

  // Helper methods untuk dropdown/select
  async getTeachersList() {
    return await this.prisma.teachers.findMany({
      select: {
        id: true,
        name: true,
        nip: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getClassesList() {
    return await this.prisma.classes.findMany({
      select: {
        id: true,
        name: true,
        semester: true,
        courses: {
          select: {
            code: true,
            name: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getCoursesList() {
    return await this.prisma.courses.findMany({
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getWifiNetworksList() {
    return await this.prisma.wifi_networks.findMany({
      where: { isActive: true },
      select: {
        id: true,
        ssid: true,
      },
      orderBy: { ssid: 'asc' },
    });
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
