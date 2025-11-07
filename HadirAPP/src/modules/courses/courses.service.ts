import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async createCourse(data: { code: string; name: string; description?: string; teacherId: string; credits?: number }) {
    const { code, name, description, teacherId, credits } = data;

    const existing = await this.prisma.courses.findUnique({ where: { code } });
    if (existing) throw new BadRequestException('Kode mata kuliah sudah digunakan');

    const teacher = await this.prisma.teachers.findUnique({ where: { id: teacherId } });
    if (!teacher) throw new NotFoundException('Guru pengampu tidak ditemukan');

    const course = await this.prisma.courses.create({
      data: {
        id: uuidv4(),
        code,
        name,
        description,
        teacherId,
        credits: credits ?? 2,
        updatedAt: new Date(),
      },
    });

    return { message: 'Mata kuliah berhasil dibuat', course };
  }

  async getAllCourses() {
    return await this.prisma.courses.findMany({
      include: { teachers: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCourseById(id: string) {
    const course = await this.prisma.courses.findUnique({
      where: { id },
      include: { teachers: true },
    });
    if (!course) throw new NotFoundException('Mata kuliah tidak ditemukan');
    return course;
  }

  async updateCourse(id: string, data: any) {
    try {
      const existing = await this.prisma.courses.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('Mata kuliah tidak ditemukan');
      
      if (data.teacherId) {
        const teacher = await this.prisma.teachers.findUnique({ where: { id: data.teacherId } });
        if (!teacher) throw new BadRequestException('Guru pengampu tidak ditemukan');
      }

      delete data.message;
      delete data.id; // Jangan izinkan perubahan ID

      const updated = await this.prisma.courses.update({
        where: { id },
        data: { ...data, updatedAt: new Date() },
      });

      return { message: 'Mata kuliah berhasil diperbarui', updated };
    } catch (error) {
      console.error('❌ Error updating course:', JSON.stringify(error, null, 2));
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new BadRequestException('Gagal memperbarui mata kuliah');
    }
  }

  async deleteCourse(id: string) {
    const existing = await this.prisma.courses.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Mata kuliah tidak ditemukan');

    await this.prisma.courses.delete({ where: { id } });
    return { message: 'Mata kuliah berhasil dihapus' };
  }
}
