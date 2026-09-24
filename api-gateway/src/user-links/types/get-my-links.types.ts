export enum UserLinkType {
  GITHUB = 'GITHUB',
  TELEGRAM = 'TELEGRAM',
  LINKEDIN = 'LINKEDIN',
  PORTFOLIO = 'PORTFOLIO',
  WEBSITE = 'WEBSITE',
  BEHANCE = 'BEHANCE',
  OTHER = 'OTHER',
}

export type GetMyLinksPayload = {
  userId: string;
};

export type UserLinkKafkaItem = {
  id: string;

  type: UserLinkType;

  url: string;
  title: string;

  sortOrder: number;
};

export type GetMyLinksKafkaResponse = {
  links: UserLinkKafkaItem[];
};