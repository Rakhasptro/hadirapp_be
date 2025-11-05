import { Controller, Get, Post, Put, Delete, Param, Body, BadRequestException } from '@nestjs/common';
import { CoursesService } from './courses.service';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  async createCourse(
    @Body() body: { 
      code: string;
      name: string;
      description?: string;
      teacherId: string;
      credits?: number;
    }
  ) {
    if (!body.code || !body.name || !body.teacherId) {
      throw new BadRequestException('Kode, nama, dan ID guru pengampu harus diisi');
    }
    return this.coursesService.createCourse(body);
  }

  @Get()
  getAllCourses() {
    return this.coursesService.getAllCourses();
  }

  @Get(':id')
  getCourseById(@Param('id') id: string) {
    return this.coursesService.getCourseById(id);
  }

  @Put(':id')
  updateCourse(@Param('id') id: string, @Body() body: any) {
    return this.coursesService.updateCourse(id, body);
  }

  @Delete(':id')
  deleteCourse(@Param('id') id: string) {
    return this.coursesService.deleteCourse(id);
  }
}
