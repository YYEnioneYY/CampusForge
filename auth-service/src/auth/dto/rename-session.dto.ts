import { Transform } from 'class-transformer';
import {
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RenameSessionDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  currentSessionId!: string;

  @IsUUID()
  sessionId!: string;

  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim()
      : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  sessionName!: string;
}