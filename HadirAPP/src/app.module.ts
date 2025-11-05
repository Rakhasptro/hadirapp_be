import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProfileModule } from './modules/profile/profile.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { AdminModule } from './modules/admin/admin.module';
import { ClassesModule } from 'modules/classes/classes.module';
import { CoursesModule } from 'modules/courses/courses.module';
import { SchedulesModule } from './modules/schedules/schedules.module';
import { LeaveModule } from './modules/leave/leave.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { TeachersModule } from 'modules/teachers/teachers.module';
import { WifiModule } from './modules/wifi/wifi.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AdminModule,
    NotificationsModule,
    SchedulesModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    ProfileModule,
    AttendanceModule,
    ClassesModule,
    CoursesModule,
    LeaveModule,
    TeachersModule,
    WifiModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
