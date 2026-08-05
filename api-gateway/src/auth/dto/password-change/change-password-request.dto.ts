import {
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ChangePasswordRequestDto {
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  currentPassword!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword!: string;
}