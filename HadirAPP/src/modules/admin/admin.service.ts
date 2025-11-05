import { Injectable } from '@nestjs/common';
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
  async getAllUsers() {
    return this.prisma.users.findMany({
      include: {
        students: true,
        teachers: true,
      },
    });
  }

  // 🏫 Daftar Semua Kelas
  async getAllClasses() {
    return this.prisma.classes.findMany({
      include: { students: true },
    });
  }

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
            grade: true,
            major: true,
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
        grade: true,
        major: true,
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
