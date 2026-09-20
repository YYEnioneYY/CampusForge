export type GetPublicProfilePayload = {
  username: string;
};

export type GetPublicProfileKafkaResponse = {
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

    isPrivate: boolean;
  };
};