import type {
  AdminUserKafka,
} from './admin-user-kafka.type';

export type AdminGetUsersKafkaResponse = {
  items: AdminUserKafka[];

  meta: {
    page: number;
    limit: number;

    total: number;
    totalPages: number;

    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};