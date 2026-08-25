import {
  ProfileVisibility,
} from '../../generated/prisma/client';

export type ProfileResponse = {
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

    visibility: ProfileVisibility;
  };
};