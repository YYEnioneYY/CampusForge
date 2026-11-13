import {
  Injectable,
} from '@nestjs/common';

import {
  PrismaService,
} from '../prisma/prisma.service';

import {
  OrganizationCreationRequestStatus,
} from '../generated/prisma/enums';

const creationRequestSelect = {
  id: true,

  name: true,
  slug: true,

  description: true,

  legalName: true,

  registrationCountryCode: true,
  registrationNumber: true,
  taxId: true,

  websiteUrl: true,
  contactEmail: true,

  timeZone: true,

  status: true,

  organizationId: true,

  submittedAt: true,
  reviewedAt: true,
  cancelledAt: true,

  reviewComment: true,

  createdAt: true,
  updatedAt: true,
} as const;

export type CreateOrganizationCreationRequestData = {
  applicantUserId: string;

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
};

@Injectable()
export class OrganizationCreationRequestsRepository {
  constructor(
    private readonly prisma:
      PrismaService,
  ) {}

  async organizationSlugExists(
    slug: string,
  ): Promise<boolean> {
    const organization =
      await this.prisma.organization.findUnique({
        where: {
          slug,
        },

        select: {
          id: true,
        },
      });

    return organization !== null;
  }

  async createDraft(
    data:
      CreateOrganizationCreationRequestData,
  ) {
    return this.prisma
      .organizationCreationRequest
      .create({
        data: {
          applicantUserId:
            data.applicantUserId,

          name:
            data.name,

          slug:
            data.slug,

          description:
            data.description,

          legalName:
            data.legalName,

          registrationCountryCode:
            data.registrationCountryCode,

          registrationNumber:
            data.registrationNumber,

          taxId:
            data.taxId,

          websiteUrl:
            data.websiteUrl,

          contactEmail:
            data.contactEmail,

          timeZone:
            data.timeZone,

          status:
            OrganizationCreationRequestStatus.DRAFT,
        },

        select:
          creationRequestSelect,
      });
  }
}