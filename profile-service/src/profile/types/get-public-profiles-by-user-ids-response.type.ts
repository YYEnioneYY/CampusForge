export type GetPublicProfilesByUserIdsResponse = {
  profiles: Array<{
    userId: string;

    username: string;

    firstName: string;
    lastName: string;
    middleName: string | null;

    avatarId: string | null;
  }>;
};