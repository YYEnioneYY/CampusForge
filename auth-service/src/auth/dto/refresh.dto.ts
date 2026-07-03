import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RefreshDto {
  @IsString()
  refreshToken!: string;

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