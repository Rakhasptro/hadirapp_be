import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  // GET /teachers/dashboard - Dashboard stats untuk teacher yang login
  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER')
  async getTeacherDashboard(@Request() req) {
    return this.teachersService.getTeacherDashboard(req.user);
  }

  // GET /teachers/my-schedule - Jadwal mengajar teacher
  @Get('my-schedule')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER')
  async getMySchedule(@Request() req) {
    return this.teachersService.getMySchedule(req.user);
  }

  // GET /teachers/my-classes - Kelas yang diampu
  @Get('my-classes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER')
  async getMyClasses(@Request() req) {
    return this.teachersService.getMyClasses(req.user);
  }

  // POST /teachers (Biasanya hanya oleh TEACHER or privileged user)
  @Post()
  create(@Body() createTeacherDto: CreateTeacherDto) {
    return this.teachersService.create(createTeacherDto);
  }

  // GET /teachers
  @Get()
  findAll() {
    return this.teachersService.findAll();
  }

  // GET /teachers/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teachersService.findOne(id);
  }

  // PATCH /teachers/:id
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTeacherDto: UpdateTeacherDto) {
    return this.teachersService.update(id, updateTeacherDto);
  }

  // DELETE /teachers/:id (Biasanya hanya oleh TEACHER or privileged user)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Mengembalikan 204 No Content untuk operasi penghapusan sukses
  remove(@Param('id') id: string) {
    return this.teachersService.remove(id);
  }
}