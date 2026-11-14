import {
  OrganizationCreationRequestStatus,
} from '../../common/enums/organization-creation-request-status.enum';

export class OrganizationCreationRequestResponseDto {
  id!: string;

  name!: string;
  slug!: string;

  description!: string | null;

  legalName!: string;

  registrationCountryCode!: string;
  registrationNumber!: string;
  taxId!: string | null;

  websiteUrl!: string | null;
  contactEmail!: string | null;

  timeZone!: string;

  status!:
    OrganizationCreationRequestStatus;

  organizationId!: string | null;

  submittedAt!: string | null;
  reviewedAt!: string | null;
  cancelledAt!: string | null;

  reviewComment!: string | null;

  createdAt!: string;
  updatedAt!: string;
}