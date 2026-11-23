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

  async findOneForUser(
    userId: string,
    requestId: string,
  ) {
    return this.prisma
      .organizationCreationRequest
      .findFirst({
        where: {
          id:
            requestId,

          applicantUserId:
            userId,
        },

        select:
          creationRequestSelect,
      });
  }

  async activeRequestSlugExists(
    slug: string,
    excludedRequestId: string,
  ): Promise<boolean> {
    const request =
      await this.prisma
        .organizationCreationRequest
        .findFirst({
          where: {
            slug,

            id: {
              not:
                excludedRequestId,
            },

            status: {
              in: [
                OrganizationCreationRequestStatus
                  .SUBMITTED,

                OrganizationCreationRequestStatus
                  .IN_REVIEW,

                OrganizationCreationRequestStatus
                  .APPROVED,
              ],
            },
          },

          select: {
            id: true,
          },
        });

    return request !== null;
  }

  async submitDraftForUser(
    userId: string,
    requestId: string,
  ) {
    const submittedAt = new Date();

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
            status:
              OrganizationCreationRequestStatus.SUBMITTED,

            submittedAt,

            cancelledAt:
              null,
          },

          select:
            creationRequestSelect,
        });

    return updated[0] ?? null;
  }

  async deleteDraftForUser(
    userId: string,
    requestId: string,
  ) {
    const result =
      await this.prisma
        .organizationCreationRequest
        .deleteMany({
          where: {
            id:
              requestId,

            applicantUserId:
              userId,

            status:
              OrganizationCreationRequestStatus.DRAFT,
          },
        });

    if (result.count === 1) {
      return {
        status:
          'deleted',
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
        'not_deletable',
    } as const;
  }

  async cancelSubmittedForUser(
    userId: string,
    requestId: string,
  ) {
    const cancelledAt = new Date();

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
              OrganizationCreationRequestStatus.SUBMITTED,
          },

          data: {
            status:
              OrganizationCreationRequestStatus.CANCELLED,

            cancelledAt,
          },

          select:
            creationRequestSelect,
        });

    const request =
      updated[0];

    if (request) {
      return {
        status:
          'cancelled',

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
        'not_cancellable',
    } as const;
  }
}