import {
  Transform,
} from 'class-transformer';

import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateWorkExperienceDto {
  @IsUUID()
  userId!: string;

  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim()
      : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  company!: string;

  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim()
      : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  position!: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim() || null
      : value,
  )
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString(
    {
      strict: true,
      strictSeparator: true,
    },
    {
      message:
        'startedAt must be a valid date in YYYY-MM-DD format',
    },
  )
  startedAt!: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString(
    {
      strict: true,
      strictSeparator: true,
    },
    {
      message:
        'endedAt must be a valid date in YYYY-MM-DD format',
    },
  )
  endedAt?: string | null;

  @IsBoolean()
  isCurrent!: boolean;
}