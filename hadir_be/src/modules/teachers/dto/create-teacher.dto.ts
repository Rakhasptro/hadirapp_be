import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateTeacherDto {
  // ID pengguna yang sudah ada di tabel 'users'
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  nip: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  phone?: string;
}