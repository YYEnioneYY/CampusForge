export type PublicProfileResponse = {
  profile: {
    userId: string;

    username: string;

    firstName: string;
    lastName: string;
    middleName: string | null;

    avatarId: string | null;

    bio: string | null;

    countryCode: string | null;
    countryName: string | null;
  };
};