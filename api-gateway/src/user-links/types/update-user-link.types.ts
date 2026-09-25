import type {
  UserLinkKafkaItem,
  UserLinkType,
} from './get-my-links.types';

export type UpdateUserLinkPayload = {
  id: string;
  userId: string;

  type?: UserLinkType;

  url?: string;
  title?: string;
};

export type UpdateUserLinkKafkaResponse = {
  link: UserLinkKafkaItem;
};