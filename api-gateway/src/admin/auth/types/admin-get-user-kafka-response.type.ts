import type {
  AdminUserKafka,
} from './admin-user-kafka.type';

export type AdminGetUserKafkaResponse = {
  user: AdminUserKafka & {
    activeSessionsCount: number;
  };
};