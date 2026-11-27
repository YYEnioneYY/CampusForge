import type {
  OrganizationCreationRequestStatus,
} from '../../../common/enums/organization-creation-request-status.enum';

export type GetOrganizationCreationRequestsPayload = {
  page: number;
  limit: number;

  status:
    OrganizationCreationRequestStatus;
};

export type ModerationOrganizationCreationRequestKafkaItem = {
  id: string;

  applicantUserId: string;

  name: string;
  slug: string;
  legalName: string;

  registrationCountryCode: string;
  registrationNumber: string;

  contactEmail: string | null;

  status:
    OrganizationCreationRequestStatus;

  reviewedByUserId: string | null;

  submittedAt: string | null;
  reviewedAt: string | null;
  cancelledAt: string | null;

  createdAt: string;
  updatedAt: string;
};

export type GetOrganizationCreationRequestsKafkaResponse = {
  items:
    ModerationOrganizationCreationRequestKafkaItem[];

  meta: {
    page: number;
    limit: number;

    total: number;
    totalPages: number;

    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};