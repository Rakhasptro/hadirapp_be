import { Module } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Import PrismaModule

@Module({
  imports: [PrismaModule], // Pastikan PrismaModule di-import
  controllers: [TeachersController],
  providers: [TeachersService],
  exports: [TeachersService], // Export jika service ini akan digunakan oleh modul lain (misal: CoursesModule)
})
export class TeachersModule {}