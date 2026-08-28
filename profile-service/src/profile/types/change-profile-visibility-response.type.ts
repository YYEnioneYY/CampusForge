import type { ProfileVisibility } from '../../generated/prisma/client';

export type ChangeProfileVisibilityResponse = {
  visibility: ProfileVisibility;
};