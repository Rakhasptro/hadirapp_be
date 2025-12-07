import { Body, Controller, Post, Req, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { AuthService } from './auth.service';
import type { Request } from 'express';

class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'strongPassword123', description: 'Plain text password' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'STUDENT', description: 'Role: STUDENT | TEACHER', required: false })
  @IsOptional()
  role?: string;
}

class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'strongPassword123' })
  @IsString()
  password: string;
}

class ResetPasswordDto {
  @ApiProperty({ example: 'teacher@example.com', description: 'Email for teacher or NPM for student', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: '123456789', description: 'NPM for student', required: false })
  @IsOptional()
  @IsString()
  npm?: string;

  @ApiProperty({ example: 'newPassword123', description: 'New password' })
  @IsString()
  @MinLength(6)
  newPassword: string;

  @ApiProperty({ example: 'newPassword123', description: 'Confirm new password' })
  @IsString()
  @MinLength(6)
  confirmPassword: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  async register(@Body() body: RegisterDto, @Req() req: Request) {
    return this.authService.register(body?.email, body?.password, body?.role || 'STUDENT');
  }

  @Post('login')
  @ApiOperation({ summary: 'Authenticate user and return JWT' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful, returns access_token' })
  async login(@Body() body: LoginDto) {
    if (!body?.email || !body?.password) {
      throw new BadRequestException('Email dan password harus diisi');
    }
    
    try {
      return await this.authService.login(body.email, body.password);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException('Email atau password salah');
      }
      throw error;
    }
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password for teacher (using email) or student (using NPM)' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  async resetPassword(@Body() body: ResetPasswordDto) {
    if (!body?.email && !body?.npm) {
      throw new BadRequestException('Email (untuk teacher) atau NPM (untuk student) harus diisi');
    }

    if (!body?.newPassword || !body?.confirmPassword) {
      throw new BadRequestException('Password baru dan konfirmasi password harus diisi');
    }

    if (body.newPassword !== body.confirmPassword) {
      throw new BadRequestException('Password baru dan konfirmasi password tidak sama');
    }

    return this.authService.resetPassword(body.email, body.npm, body.newPassword);
  }
}