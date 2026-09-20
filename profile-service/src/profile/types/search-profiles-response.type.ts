export type SearchProfilesResponse = {
  items: Array<{
    userId: string;

    username: string;

    firstName: string;
    lastName: string;
    middleName: string | null;

    avatarId: string | null;

    isPrivate: boolean;
  }>;

  meta: {
    page: number;
    limit: number;

    total: number;
    totalPages: number;

    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};