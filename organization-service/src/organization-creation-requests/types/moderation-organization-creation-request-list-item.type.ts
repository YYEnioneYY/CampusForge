import type {
  OrganizationCreationRequestStatus,
} from '../../generated/prisma/enums';

export type ModerationOrganizationCreationRequestListItem = {
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