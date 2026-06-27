import { IsString, MinLength } from 'class-validator';

export class ResendEmailVerificationDto {
  @IsString()
  @MinLength(20)
  accessToken!: string;
}