import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles('ADMIN')
  async getAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'TEACHER')
  async getOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
