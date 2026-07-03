import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';

export class SendPasswordChangedDto {
  @IsUUID()
  userId!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  name?: string;
}