import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'your_refresh_token',
  })
  @IsString()
  @MinLength(20)
  refreshToken!: string;
}