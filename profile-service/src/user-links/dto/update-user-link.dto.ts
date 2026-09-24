import {
  Transform,
} from 'class-transformer';

import {
  IsEnum,
  IsString,
  IsUrl,
  IsOptional,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

import {
  UserLinkType,
} from '../../generated/prisma/client';

export class UpdateUserLinkDto {
  @IsUUID()
  id!: string;
  
  @IsUUID()
  userId!: string;

  @IsOptional()
  @IsEnum(UserLinkType)
  type?: UserLinkType;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim()
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
  url?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim()
      : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title?: string;
}