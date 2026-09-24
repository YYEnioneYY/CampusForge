import type { UserLinkType } from '../../generated/prisma/client';

export type UserLinkResponse = {
  id: string;

  type: UserLinkType;

  url: string;
  title: string;

  sortOrder: number;
};

export type GetMyLinksResponse = {
  links: UserLinkResponse[];
};