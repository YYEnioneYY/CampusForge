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

import {
  GetMyOrganizationCreationRequestsDto,
} from './dto/get-my-organization-creation-requests.dto';

import type {
  GetMyOrganizationCreationRequestsResponse,
} from './types/get-my-organization-creation-requests-response.type';

import {
  UpdateOrganizationCreationRequestDto,
} from './dto/update-organization-creation-request.dto';

import type {
  UpdateOrganizationCreationRequestData,
} from './organization-creation-requests.repository';

import type {
  UpdateOrganizationCreationRequestResponse,
} from './types/update-organization-creation-request-response.type';

import {
  OrganizationCreationRequestStatus,
} from '../generated/prisma/enums';

import {
  SubmitOrganizationCreationRequestDto,
} from './dto/submit-organization-creation-request.dto';

import type {
  SubmitOrganizationCreationRequestResponse,
} from './types/submit-organization-creation-request-response.type';

import {
  DeleteOrganizationCreationRequestDraftDto,
} from './dto/delete-organization-creation-request-draft.dto';

import type {
  DeleteOrganizationCreationRequestDraftResponse,
} from './types/delete-organization-creation-request-draft-response.type';

import {
  CancelOrganizationCreationRequestDto,
} from './dto/cancel-organization-creation-request.dto';

import type {
  CancelOrganizationCreationRequestResponse,
} from './types/cancel-organization-creation-request-response.type';

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

  async getMy(
    dto: GetMyOrganizationCreationRequestsDto,
  ): Promise<GetMyOrganizationCreationRequestsResponse> {
    const requests =
      await this.repository
        .findAllByApplicantUserId(
          dto.userId,
        );

    return {
      requests:
        requests.map(
          (request) => ({
            ...request,

            submittedAt:
              request.submittedAt
                ?.toISOString() ?? null,

            reviewedAt:
              request.reviewedAt
                ?.toISOString() ?? null,

            cancelledAt:
              request.cancelledAt
                ?.toISOString() ?? null,

            createdAt:
              request.createdAt
                .toISOString(),

            updatedAt:
              request.updatedAt
                .toISOString(),
          }),
        ),
    };
  }

  async updateDraft(
    dto: UpdateOrganizationCreationRequestDto,
  ): Promise<UpdateOrganizationCreationRequestResponse> {
    const hasUpdates = [
      dto.name,
      dto.slug,
      dto.description,
      dto.legalName,
      dto.registrationCountryCode,
      dto.registrationNumber,
      dto.taxId,
      dto.websiteUrl,
      dto.contactEmail,
      dto.timeZone,
    ].some(
      (value) =>
        value !== undefined,
    );

    if (!hasUpdates) {
      throwRpcError(
        RpcErrorCode.VALIDATION_ERROR,
        'At least one field must be provided',
      );
    }

    if (dto.slug !== undefined) {
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
    }

    const data:
      UpdateOrganizationCreationRequestData = {
        name:
          dto.name,

        slug:
          dto.slug,

        description:
          dto.description,

        legalName:
          dto.legalName,

        registrationCountryCode:
          dto.registrationCountryCode,

        registrationNumber:
          dto.registrationNumber,

        taxId:
          dto.taxId,

        websiteUrl:
          dto.websiteUrl,

        contactEmail:
          dto.contactEmail,

        timeZone:
          dto.timeZone,
      };

    const result =
      await this.repository
        .updateDraftForUser(
          dto.userId,
          dto.requestId,
          data,
        );

    if (
      result.status ===
      'not_found'
    ) {
      throwRpcError(
        RpcErrorCode
          .ORGANIZATION_CREATION_REQUEST_NOT_FOUND,

        'Organization creation request not found',
      );
    }

    if (
      result.status ===
      'not_editable'
    ) {
      throwRpcError(
        RpcErrorCode
          .ORGANIZATION_CREATION_REQUEST_NOT_EDITABLE,

        'Only draft organization creation requests can be updated',
      );
    }

    return {
      request: {
        ...result.request,

        submittedAt:
          result.request.submittedAt
            ?.toISOString() ?? null,

        reviewedAt:
          result.request.reviewedAt
            ?.toISOString() ?? null,

        cancelledAt:
          result.request.cancelledAt
            ?.toISOString() ?? null,

        createdAt:
          result.request.createdAt
            .toISOString(),

        updatedAt:
          result.request.updatedAt
            .toISOString(),
      },
    };
  }

  async submit(
    dto: SubmitOrganizationCreationRequestDto,
  ): Promise<SubmitOrganizationCreationRequestResponse> {
    const existing =
      await this.repository
        .findOneForUser(
          dto.userId,
          dto.requestId,
        );

    if (!existing) {
      throwRpcError(
        RpcErrorCode
          .ORGANIZATION_CREATION_REQUEST_NOT_FOUND,

        'Organization creation request not found',
      );
    }

    if (
      existing.status !==
      OrganizationCreationRequestStatus.DRAFT
    ) {
      throwRpcError(
        RpcErrorCode
          .ORGANIZATION_CREATION_REQUEST_NOT_SUBMITTABLE,

        'Only draft organization creation requests can be submitted',
      );
    }

    const organizationSlugExists =
      await this.repository
        .organizationSlugExists(
          existing.slug,
        );

    if (organizationSlugExists) {
      throwRpcError(
        RpcErrorCode
          .ORGANIZATION_SLUG_ALREADY_EXISTS,

        'Organization slug already exists',
      );
    }

    const activeRequestSlugExists =
      await this.repository
        .activeRequestSlugExists(
          existing.slug,
          existing.id,
        );

    if (activeRequestSlugExists) {
      throwRpcError(
        RpcErrorCode
          .ORGANIZATION_SLUG_ALREADY_EXISTS,

        'Organization slug is already used by another active request',
      );
    }

    const submitted =
      await this.repository
        .submitDraftForUser(
          dto.userId,
          dto.requestId,
        );

    if (!submitted) {
      throwRpcError(
        RpcErrorCode
          .ORGANIZATION_CREATION_REQUEST_NOT_SUBMITTABLE,

        'Organization creation request is no longer a draft',
      );
    }

    return {
      request: {
        ...submitted,

        submittedAt:
          submitted.submittedAt
            ?.toISOString() ?? null,

        reviewedAt:
          submitted.reviewedAt
            ?.toISOString() ?? null,

        cancelledAt:
          submitted.cancelledAt
            ?.toISOString() ?? null,

        createdAt:
          submitted.createdAt
            .toISOString(),

        updatedAt:
          submitted.updatedAt
            .toISOString(),
      },
    };
  }

  async deleteDraft(
    dto: DeleteOrganizationCreationRequestDraftDto,
  ): Promise<DeleteOrganizationCreationRequestDraftResponse> {
    const result =
      await this.repository
        .deleteDraftForUser(
          dto.userId,
          dto.requestId,
        );

    if (
      result.status ===
      'not_found'
    ) {
      throwRpcError(
        RpcErrorCode
          .ORGANIZATION_CREATION_REQUEST_NOT_FOUND,

        'Organization creation request not found',
      );
    }

    if (
      result.status ===
      'not_deletable'
    ) {
      throwRpcError(
        RpcErrorCode
          .ORGANIZATION_CREATION_REQUEST_NOT_DELETABLE,

        'Only draft organization creation requests can be deleted',
      );
    }

    return {
      success: true,
    };
  }

  async cancel(
    dto: CancelOrganizationCreationRequestDto,
  ): Promise<CancelOrganizationCreationRequestResponse> {
    const result =
      await this.repository
        .cancelSubmittedForUser(
          dto.userId,
          dto.requestId,
        );

    if (
      result.status ===
      'not_found'
    ) {
      throwRpcError(
        RpcErrorCode
          .ORGANIZATION_CREATION_REQUEST_NOT_FOUND,

        'Organization creation request not found',
      );
    }

    if (
      result.status ===
      'not_cancellable'
    ) {
      throwRpcError(
        RpcErrorCode
          .ORGANIZATION_CREATION_REQUEST_NOT_CANCELLABLE,

        'Only submitted organization creation requests can be cancelled',
      );
    }

    return {
      request: {
        ...result.request,

        submittedAt:
          result.request.submittedAt
            ?.toISOString() ?? null,

        reviewedAt:
          result.request.reviewedAt
            ?.toISOString() ?? null,

        cancelledAt:
          result.request.cancelledAt
            ?.toISOString() ?? null,

        createdAt:
          result.request.createdAt
            .toISOString(),

        updatedAt:
          result.request.updatedAt
            .toISOString(),
      },
    };
  }
}