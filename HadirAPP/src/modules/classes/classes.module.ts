import { Module } from '@nestjs/common';
import { ClassesController } from './classes.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ClassesService } from './classes.service';

@Module({
  imports: [PrismaModule],
  controllers: [ClassesController],
  providers: [ClassesService],
})
export class ClassesModule {}
