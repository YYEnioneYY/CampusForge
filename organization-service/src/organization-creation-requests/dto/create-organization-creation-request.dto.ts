import {
  Transform,
} from 'class-transformer';

import {
  IsEmail,
  IsISO31661Alpha2,
  IsOptional,
  IsString,
  IsTimeZone,
  IsUrl,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateOrganizationCreationRequestDto {
  @IsUUID()
  userId!: string;

  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim()
      : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toLowerCase()
      : value,
  )
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  @Matches(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    {
      message:
        'slug must contain only lowercase Latin letters, numbers and single hyphens',
    },
  )
  slug!: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim() || null
      : value,
  )
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim()
      : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  legalName!: string;

  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toUpperCase()
      : value,
  )
  @IsISO31661Alpha2()
  registrationCountryCode!: string;

  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toUpperCase()
      : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  registrationNumber!: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toUpperCase() || null
      : value,
  )
  @IsString()
  @MaxLength(100)
  taxId?: string | null;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim() || null
      : value,
  )
  @IsUrl({
    protocols: [
      'http',
      'https',
    ],
    require_protocol: true,
  })
  @MaxLength(2048)
  websiteUrl?: string | null;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toLowerCase() || null
      : value,
  )
  @IsEmail()
  @MaxLength(320)
  contactEmail?: string | null;

  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim()
      : value,
  )
  @IsString()
  @IsTimeZone()
  @MaxLength(100)
  timeZone!: string;
}