import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MinLength } from 'class-validator';

export class LogoutSessionDto {
  @ApiProperty({
    example: 'your_refresh_token',
  })
  @IsString()
  @MinLength(20)
  refreshToken!: string;

  @ApiProperty({
    example: 'd0d6239e-5c7a-4a12-96f0-6a6e2a1d7a1e',
  })
  @IsUUID()
  sessionId!: string;
}