import { IsOptional, IsString, MaxLength, IsUUID } from 'class-validator';

export class RefreshDto {
  @IsString()
  refreshToken!: string;

  @IsOptional()
  @IsUUID('4')
  deviceId?: string | null;

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