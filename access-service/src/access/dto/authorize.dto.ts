import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

import {
  AccessScopeType,
} from '../../generated/prisma/client';

export class AuthorizeDto {
  @IsUUID()
  actorUserId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(150)
  permission!: string;

  @IsEnum(AccessScopeType)
  scopeType!: AccessScopeType;

  @IsOptional()
  @IsUUID()
  scopeId?: string;
}