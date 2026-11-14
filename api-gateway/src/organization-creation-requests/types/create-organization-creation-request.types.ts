import type {
  OrganizationCreationRequestStatus,
} from '../../common/enums/organization-creation-request-status.enum';

export type CreateOrganizationCreationRequestPayload = {
  userId: string;

  name: string;
  slug: string;

  description?: string | null;

  legalName: string;

  registrationCountryCode: string;
  registrationNumber: string;
  taxId?: string | null;

  websiteUrl?: string | null;
  contactEmail?: string | null;

  timeZone: string;
};

export type OrganizationCreationRequestKafkaItem = {
  id: string;

  name: string;
  slug: string;

  description: string | null;

  legalName: string;

  registrationCountryCode: string;
  registrationNumber: string;
  taxId: string | null;

  websiteUrl: string | null;
  contactEmail: string | null;

  timeZone: string;

  status:
    OrganizationCreationRequestStatus;

  organizationId: string | null;

  submittedAt: string | null;
  reviewedAt: string | null;
  cancelledAt: string | null;

  reviewComment: string | null;

  createdAt: string;
  updatedAt: string;
};

export type CreateOrganizationCreationRequestKafkaResponse = {
  request:
    OrganizationCreationRequestKafkaItem;
};