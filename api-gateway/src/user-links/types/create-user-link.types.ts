import { UserLinkType, UserLinkKafkaItem } from "./get-my-links.types";

export type CreateUserLinkPayload = {
  userId: string;

  type: UserLinkType;

  url: string;
  title: string;
};

export type CreateUserLinkKafkaResponse = {
  link: UserLinkKafkaItem;
};