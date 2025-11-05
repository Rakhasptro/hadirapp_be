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
  async create(data: { name: string; grade: string; major?: string; capacity?: number }) {
    try {
      // Validasi duplikat nama kelas
      const existing = await this.prisma.classes.findUnique({ where: { name: data.name } });
      if (existing) throw new BadRequestException('Nama kelas sudah digunakan');

      return this.prisma.classes.create({
        data: {
          id: uuidv4(),
          name: data.name,
          grade: data.grade,
          major: data.major || null,
          capacity: data.capacity ?? 40,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error creating class:', error);
      throw new BadRequestException('Gagal membuat kelas');
    }
  }

  // ✏️ Update kelas
  async update(id: string, data: { name?: string; grade?: string; major?: string; capacity?: number }) {
    const cls = await this.prisma.classes.findUnique({ where: { id } });
    if (!cls) throw new NotFoundException('Kelas tidak ditemukan');

    return this.prisma.classes.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
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
