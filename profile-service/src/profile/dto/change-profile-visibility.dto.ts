import {
  IsEnum,
  IsUUID,
} from 'class-validator';

import { ProfileVisibility } from '../../generated/prisma/client';

export class ChangeProfileVisibilityDto {
  @IsUUID()
  userId!: string;

  @IsEnum(ProfileVisibility)
  visibility!: ProfileVisibility;
}