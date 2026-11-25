import type {
  ModerationOrganizationCreationRequestListItem,
} from './moderation-organization-creation-request-list-item.type';

export type GetModerationOrganizationCreationRequestsResponse = {
  items:
    ModerationOrganizationCreationRequestListItem[];

  meta: {
    page: number;
    limit: number;

    total: number;
    totalPages: number;

    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};