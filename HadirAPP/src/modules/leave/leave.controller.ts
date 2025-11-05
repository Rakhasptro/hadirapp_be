import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { LeaveService } from './leave.service';

@Controller('leave')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  createLeave(@Body() body: any) {
    return this.leaveService.createLeave(body);
  }

  @Get()
  getAllLeaves() {
    return this.leaveService.getAllLeaves();
  }

  @Get('student/:id')
  getLeavesByStudent(@Param('id') studentId: string) {
    return this.leaveService.getLeavesByStudent(studentId);
  }

  @Put(':id/review')
  reviewLeave(@Param('id') id: string, @Body() body: any) {
    const { reviewerId, status, notes } = body;
    return this.leaveService.reviewLeave(id, reviewerId, status, notes);
  }

  @Delete(':id')
  deleteLeave(@Param('id') id: string, @Body() body: any) {
    const { userId } = body;
    return this.leaveService.deleteLeave(id, userId);
  }
}
