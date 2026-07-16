import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class AccountRestoreEventDto {
  @IsEmail()
  email!: string;

  @IsUrl()
  restoreUrl!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;
}