import type {
  OrganizationCreationRequestResponse,
} from './organization-creation-request-response.type';

export type ModerationOrganizationCreationRequestDetails =
  OrganizationCreationRequestResponse & {
    applicantUserId: string;
    reviewedByUserId: string | null;
  };

export type GetModerationOrganizationCreationRequestResponse = {
  request:
    ModerationOrganizationCreationRequestDetails;
};