import { Module } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';
import { SchedulesPublicController } from './schedules-public.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SchedulesController, SchedulesPublicController],
  providers: [SchedulesService],
  exports: [SchedulesService],
})
export class SchedulesModule {}
