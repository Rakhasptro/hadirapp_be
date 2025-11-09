import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { ProfileModule } from './modules/profile/profile.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { SchedulesModule } from './modules/schedules/schedules.module';
import { TeachersModule } from 'modules/teachers/teachers.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ProfileModule,
    AttendanceModule,
    SchedulesModule,
    TeachersModule,
    UploadModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
