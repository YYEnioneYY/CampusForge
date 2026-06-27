import { IsString, IsUUID, MinLength } from 'class-validator';

export class GetSessionsDto {
  @IsString()
  @MinLength(20)
  refreshToken!: string;
}

export class LogoutSessionDto {
  @IsString()
  @MinLength(20)
  refreshToken!: string;

  @IsUUID()
  sessionId!: string;
}