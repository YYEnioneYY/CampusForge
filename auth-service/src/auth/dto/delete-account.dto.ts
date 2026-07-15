import { IsString, IsUUID, MinLength } from 'class-validator';

export class DeleteAccountDto {
  @IsUUID()
  userId!: string;

  @IsString()
  @MinLength(1)
  currentPassword!: string;
}