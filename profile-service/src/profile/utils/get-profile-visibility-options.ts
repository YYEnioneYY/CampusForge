import { ProfileVisibility } from '../../generated/prisma/client';

export function getProfileVisibilityOptions():
  ProfileVisibility[] {
  return Object.values(
    ProfileVisibility,
  );
}