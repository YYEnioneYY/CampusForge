export type SearchProfilesPayload = {
  q: string;
  page: number;
  limit: number;
};

export type SearchProfilesKafkaResponse = {
  items: Array<{
    userId: string;

    username: string;

    firstName: string;
    lastName: string;
    middleName: string | null;

    avatarId: string | null;
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