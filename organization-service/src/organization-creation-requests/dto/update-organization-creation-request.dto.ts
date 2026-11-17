import {
  Transform,
} from 'class-transformer';

import {
  IsEmail,
  IsISO31661Alpha2,
  IsString,
  IsTimeZone,
  IsUrl,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class UpdateOrganizationCreationRequestDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  requestId!: string;

  @ValidateIf(
    (_, value) =>
      value !== undefined,
  )
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim()
      : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @ValidateIf(
    (_, value) =>
      value !== undefined,
  )
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
  slug?: string;

  @ValidateIf(
    (_, value) =>
      value !== undefined &&
      value !== null,
  )
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim() || null
      : value,
  )
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @ValidateIf(
    (_, value) =>
      value !== undefined,
  )
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim()
      : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  legalName?: string;

  @ValidateIf(
    (_, value) =>
      value !== undefined,
  )
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toUpperCase()
      : value,
  )
  @IsISO31661Alpha2()
  registrationCountryCode?: string;

  @ValidateIf(
    (_, value) =>
      value !== undefined,
  )
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toUpperCase()
      : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  registrationNumber?: string;

  @ValidateIf(
    (_, value) =>
      value !== undefined &&
      value !== null,
  )
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toUpperCase() || null
      : value,
  )
  @IsString()
  @MaxLength(100)
  taxId?: string | null;

  @ValidateIf(
    (_, value) =>
      value !== undefined &&
      value !== null,
  )
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

  @ValidateIf(
    (_, value) =>
      value !== undefined &&
      value !== null,
  )
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toLowerCase() || null
      : value,
  )
  @IsEmail()
  @MaxLength(320)
  contactEmail?: string | null;

  @ValidateIf(
    (_, value) =>
      value !== undefined,
  )
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim()
      : value,
  )
  @IsString()
  @IsTimeZone()
  @MaxLength(100)
  timeZone?: string;
}