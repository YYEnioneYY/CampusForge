import {
  IsString,
  MinLength,
} from 'class-validator';

export class DeleteAccountRequestDto {
  @IsString()
  @MinLength(1)
  currentPassword!: string;
}