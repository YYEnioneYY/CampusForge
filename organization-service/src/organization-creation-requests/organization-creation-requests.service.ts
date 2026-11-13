import {
  Injectable,
} from '@nestjs/common';

import {
  RpcErrorCode,
} from '../common/rpc/rpc-error-code';

import {
  throwRpcError,
} from '../common/rpc/throw-rpc-error';

import {
  CreateOrganizationCreationRequestDto,
} from './dto/create-organization-creation-request.dto';

import {
  OrganizationCreationRequestsRepository,
} from './organization-creation-requests.repository';

import type {
  CreateOrganizationCreationRequestData,
} from './organization-creation-requests.repository';

import type {
  CreateOrganizationCreationRequestResponse,
} from './types/create-organization-creation-request-response.type';

@Injectable()
export class OrganizationCreationRequestsService {
  constructor(
    private readonly repository:
      OrganizationCreationRequestsRepository,
  ) {}

  async createDraft(
    dto:
      CreateOrganizationCreationRequestDto,
  ): Promise<CreateOrganizationCreationRequestResponse> {
    const slugExists =
      await this.repository
        .organizationSlugExists(
          dto.slug,
        );

    if (slugExists) {
      throwRpcError(
        RpcErrorCode
          .ORGANIZATION_SLUG_ALREADY_EXISTS,

        'Organization slug already exists',
      );
    }

    const data:
      CreateOrganizationCreationRequestData = {
        applicantUserId:
          dto.userId,

        name:
          dto.name,

        slug:
          dto.slug,

        description:
          dto.description ?? null,

        legalName:
          dto.legalName,

        registrationCountryCode:
          dto.registrationCountryCode,

        registrationNumber:
          dto.registrationNumber,

        taxId:
          dto.taxId ?? null,

        websiteUrl:
          dto.websiteUrl ?? null,

        contactEmail:
          dto.contactEmail ?? null,

        timeZone:
          dto.timeZone,
      };

    const request =
      await this.repository
        .createDraft(data);

    return {
      request: {
        id:
          request.id,

        name:
          request.name,

        slug:
          request.slug,

        description:
          request.description,

        legalName:
          request.legalName,

        registrationCountryCode:
          request.registrationCountryCode,

        registrationNumber:
          request.registrationNumber,

        taxId:
          request.taxId,

        websiteUrl:
          request.websiteUrl,

        contactEmail:
          request.contactEmail,

        timeZone:
          request.timeZone,

        status:
          request.status,

        organizationId:
          request.organizationId,

        submittedAt:
          request.submittedAt
            ?.toISOString() ?? null,

        reviewedAt:
          request.reviewedAt
            ?.toISOString() ?? null,

        cancelledAt:
          request.cancelledAt
            ?.toISOString() ?? null,

        reviewComment:
          request.reviewComment,

        createdAt:
          request.createdAt.toISOString(),

        updatedAt:
          request.updatedAt.toISOString(),
      },
    };
  }
}