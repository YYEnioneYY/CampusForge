import { IsEmail, IsOptional, IsString, IsUrl, IsUUID } from 'class-validator';

export class SendEmailVerificationDto {
  @IsUUID()
  userId!: string;

  @IsEmail()
  email!: string;

  @IsUrl({
    require_tld: false,
  })
  verificationUrl!: string;

  @IsOptional()
  @IsString()
  name?: string;
}