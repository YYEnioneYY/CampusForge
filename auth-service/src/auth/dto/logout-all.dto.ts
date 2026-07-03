import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class LogoutAllDto {
  @IsString()
  refreshToken!: string;

  @IsOptional()
  @IsBoolean()
  exceptCurrent?: boolean;
}