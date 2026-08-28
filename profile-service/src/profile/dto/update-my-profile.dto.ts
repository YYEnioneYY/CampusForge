import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  MaxLength,
  IsDateString,
} from 'class-validator';

export class UpdateMyProfileDto {
  @IsUUID()
  userId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  middleName?: string | null;

  @IsOptional()
  @IsString()
  bio?: string | null;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toUpperCase()
      : value,
  )
  @IsString()
  @Length(2, 2)
  @Matches(/^[A-Z]{2}$/)
  countryCode?: string | null;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString(
    {
      strict: true,
      strictSeparator: true,
    },
    {
      message:
        'dateOfBirth must be a valid date in YYYY-MM-DD format',
    },
  )
  dateOfBirth?: string | null;
}