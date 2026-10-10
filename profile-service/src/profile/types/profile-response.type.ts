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

    headline: string | null;
    position: string | null;
    company: string | null;
    timeZone: string | null;

    countryCode: string | null;
    countryName: string | null;

    dateOfBirth: string | null;

    visibility: ProfileVisibility;
  };
};