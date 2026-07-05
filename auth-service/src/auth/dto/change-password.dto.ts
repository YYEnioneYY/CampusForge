import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  currentSessionId!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  currentPassword!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword!: string;
}