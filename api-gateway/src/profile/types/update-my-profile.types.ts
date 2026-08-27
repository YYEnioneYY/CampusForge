import type {
  ProfileVisibilityValue,
} from '../dto/update-my-profile.dto';

export type UpdateMyProfilePayload = {
  userId: string;

  firstName?: string;
  lastName?: string;

  middleName?: string | null;

  bio?: string | null;

  countryCode?: string | null;

  dateOfBirth?: string | null;

  visibility?: ProfileVisibilityValue;
};

export type UpdateMyProfileResponse = {
  profile: {
    username: string;

    firstName: string;
    lastName: string;
    middleName: string | null;

    avatarId: string | null;

    bio: string | null;

    countryCode: string | null;
    countryName: string | null;

    dateOfBirth: string | null;

    visibility: string;
  };
};