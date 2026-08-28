import { IsIn } from 'class-validator';

import { PROFILE_VISIBILITIES } from '../enums/profile-visibility-value.enum';

export type ProfileVisibilityValue =
  (typeof PROFILE_VISIBILITIES)[number];

export class ChangeProfileVisibilityDto {
  @IsIn(PROFILE_VISIBILITIES)
  visibility!: ProfileVisibilityValue;
}