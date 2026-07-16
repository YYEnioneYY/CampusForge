import { IsEmail } from 'class-validator';

export class RequestAccountRestoreDto {
  @IsEmail()
  email!: string;
}