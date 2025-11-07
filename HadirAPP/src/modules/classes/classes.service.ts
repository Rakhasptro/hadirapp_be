import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}

  // 🔍 Ambil semua kelas
  async findAll() {
    return this.prisma.classes.findMany({
      include: {
        courses: {
          select: {
            id: true,
            code: true,
            name: true,
            credits: true,
          },
        },
        students: true,
        schedules: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 🔍 Ambil satu kelas berdasarkan ID
  async findOne(id: string) {
    const cls = await this.prisma.classes.findUnique({
      where: { id },
      include: {
        courses: {
          select: {
            id: true,
            code: true,
            name: true,
            credits: true,
          },
        },
        students: true,
        schedules: {
          include: {
            courses: true,
            teachers: true,
          },
        },
      },
    });

    if (!cls) throw new NotFoundException('Kelas tidak ditemukan');
    return cls;
  }

  // ➕ Tambah kelas baru
  async create(data: { courseId: string; semester: string; capacity?: number }) {
    try {
      // Validasi apakah course ada
      const course = await this.prisma.courses.findUnique({
        where: { id: data.courseId },
      });

      if (!course) {
        throw new NotFoundException('Mata kuliah tidak ditemukan');
      }

      // Nama kelas otomatis dari kode mata kuliah
      const className = course.code;

      // Validasi duplikat nama kelas
      const existing = await this.prisma.classes.findUnique({ where: { name: className } });
      if (existing) {
        throw new BadRequestException(`Kelas dengan nama ${className} sudah ada`);
      }

      return this.prisma.classes.create({
        data: {
          id: uuidv4(),
          name: className,
          semester: data.semester,
          courseId: data.courseId,
          capacity: data.capacity ?? 40,
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
        },
      });
    } catch (error) {
      console.error('Error creating class:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Gagal membuat kelas');
    }
  }

  // ✏️ Update kelas
  async update(id: string, data: { courseId?: string; semester?: string; capacity?: number }) {
    const cls = await this.prisma.classes.findUnique({ 
      where: { id },
      include: {
        courses: true,
      },
    });
    
    if (!cls) throw new NotFoundException('Kelas tidak ditemukan');

    let updateData: any = {
      updatedAt: new Date(),
    };

    // Jika courseId diubah, update nama kelas juga
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
      },
    });
  }

  // ❌ Hapus kelas
  async remove(id: string) {
    const cls = await this.prisma.classes.findUnique({ where: { id } });
    if (!cls) throw new NotFoundException('Kelas tidak ditemukan');

    await this.prisma.classes.delete({ where: { id } });
    return { message: 'Kelas berhasil dihapus' };
  }
}
