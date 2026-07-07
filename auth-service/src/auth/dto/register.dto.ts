import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  firstName!: string;
  
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  lastName!: string;
  
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  middleName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  deviceName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  ipAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  userAgent?: string;
}