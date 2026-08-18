import {
  ProfileVisibility,
} from '../../generated/prisma/client';

export type ProfileResponse = {
  profile: {
    id: string;
    userId: string;

    firstName: string;
    lastName: string;
    middleName: string | null;

    avatarUrl: string | null;
    bio: string | null;

    countryCode: string | null;
    countryName: string | null;

    dateOfBirth: string | null;

    visibility: ProfileVisibility;

    createdAt: string;
    updatedAt: string;
  };
};