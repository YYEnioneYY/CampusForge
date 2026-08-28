import type { ProfileVisibilityValue } from '../dto/change-profile-visibility.dto';

export type ChangeProfileVisibilityPayload = {
  userId: string;
  visibility: ProfileVisibilityValue;
};

export type ChangeProfileVisibilityResponse = {
  visibility: ProfileVisibilityValue;
};