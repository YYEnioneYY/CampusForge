import type {
  OrganizationCreationRequestKafkaItem,
} from './organization-creation-request.types';

export type UpdateOrganizationCreationRequestPayload = {
  userId: string;
  requestId: string;

  name?: string;
  slug?: string;

  description?: string | null;

  legalName?: string;

  registrationCountryCode?: string;
  registrationNumber?: string;
  taxId?: string | null;

  websiteUrl?: string | null;
  contactEmail?: string | null;

  timeZone?: string;
};

export type UpdateOrganizationCreationRequestKafkaResponse = {
  request: OrganizationCreationRequestKafkaItem;
};