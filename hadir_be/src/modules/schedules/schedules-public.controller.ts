import { Controller, Get, Param } from '@nestjs/common';
import { SchedulesService } from './schedules.service';

@Controller('public/schedules')
export class SchedulesPublicController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get('verify/:qrCode')
  async verifyQRCode(@Param('qrCode') qrCode: string) {
    return this.schedulesService.verifyQRCode(qrCode);
  }
}
