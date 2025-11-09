import { Controller, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ProfileService } from './profile.service';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get()
  async getProfile(@Req() req) {
    const userId = req.user.userId;
    return this.profileService.getProfileById(userId);
  }

  @Put()
  async updateProfile(@Req() req, @Body() updateData: any) {
    const userId = req.user.userId;
    return this.profileService.updateProfile(userId, updateData);
  }
}
