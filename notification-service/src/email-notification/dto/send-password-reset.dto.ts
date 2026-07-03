import { IsEmail, IsOptional, IsString, IsUrl, IsUUID } from 'class-validator';

export class SendPasswordResetDto {
  @IsUUID()
  userId!: string;

  @IsEmail()
  email!: string;

  @IsUrl({
    require_tld: false,
  })
  resetUrl!: string;

  @IsOptional()
  @IsString()
  name?: string;
}