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

export type UpdateOrganizationCreationRequestData = {
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

  async findAllByApplicantUserId(
    applicantUserId: string,
  ) {
    return this.prisma
      .organizationCreationRequest
      .findMany({
        where: {
          applicantUserId,
        },
      
        select:
          creationRequestSelect,
      
        orderBy: {
          createdAt:
            'desc',
        },
      });
  }

  async updateDraftForUser(
    userId: string,
    requestId: string,
    data:
      UpdateOrganizationCreationRequestData,
  ) {
    const updated =
      await this.prisma
        .organizationCreationRequest
        .updateManyAndReturn({
          where: {
            id:
              requestId,

            applicantUserId:
              userId,

            status:
              OrganizationCreationRequestStatus.DRAFT,
          },

          data: {
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
          },

          select:
            creationRequestSelect,
        });

    const request =
      updated[0];

    if (request) {
      return {
        status:
          'updated',

        request,
      } as const;
    }

    const existing =
      await this.prisma
        .organizationCreationRequest
        .findFirst({
          where: {
            id:
              requestId,

            applicantUserId:
              userId,
          },

          select: {
            id: true,
            status: true,
          },
        });

    if (!existing) {
      return {
        status:
          'not_found',
      } as const;
    }

    return {
      status:
        'not_editable',
    } as const;
  }
}