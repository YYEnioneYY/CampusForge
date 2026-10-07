import type {
  UserLinkKafkaItem,
} from './get-my-links.types';

export type GetPublicUserLinksPayload = {
  username: string;
};

export type GetPublicUserLinksKafkaResponse = {
  links: UserLinkKafkaItem[];
};