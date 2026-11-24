import {
  Injectable,
} from '@nestjs/common';

import {
  firstValueFrom,
} from 'rxjs';

import {
  OrganizationKafkaService,
} from '../kafka/organization-kafka.service';

import {
  ORGANIZATION_CREATION_REQUEST_PATTERNS,
} from '../kafka/patterns/organization-creation-request-patterns';

import {
  CreateOrganizationCreationRequestDto,
} from './dto/create-organization-creation-request.dto';

import {
  CreateOrganizationCreationRequestResponseDto,
} from './dto/create-organization-creation-request-response.dto';

import type {
  CreateOrganizationCreationRequestKafkaResponse,
  CreateOrganizationCreationRequestPayload,
} from './types/create-organization-creation-request.types';

import {
  GetMyOrganizationCreationRequestsResponseDto,
} from './dto/get-my-organization-creation-requests-response.dto';

import type {
  GetMyOrganizationCreationRequestsKafkaResponse,
  GetMyOrganizationCreationRequestsPayload,
} from './types/get-my-organization-creation-requests.types';

import { UpdateOrganizationCreationRequestDto } from './dto/update-organization-creation-request.dto';
import { UpdateOrganizationCreationRequestKafkaResponse } from './types/update-organization-creation-request.types';
import { UpdateOrganizationCreationRequestPayload } from './types/update-organization-creation-request.types';
import { UpdateOrganizationCreationRequestResponseDto } from './dto/update-organization-creation-request-response.dto';

import {
  SubmitOrganizationCreationRequestResponseDto,
} from './dto/submit-organization-creation-request-response.dto';

import type {
  SubmitOrganizationCreationRequestKafkaResponse,
  SubmitOrganizationCreationRequestPayload,
} from './types/submit-organization-creation-request.types';

import type {
  CommandAcknowledgement,
} from '../common/types/command-acknowledgement.type';

import type {
  DeleteOrganizationCreationRequestDraftPayload,
} from './types/delete-organization-creation-request-draft.types';

import {
  CancelOrganizationCreationRequestResponseDto,
} from './dto/cancel-organization-creation-request-response.dto';

import type {
  CancelOrganizationCreationRequestKafkaResponse,
  CancelOrganizationCreationRequestPayload,
} from './types/cancel-organization-creation-request.types';

@Injectable()
export class OrganizationCreationRequestsService {
  constructor(
    private readonly organizationKafkaService:
      OrganizationKafkaService,
  ) {}

  async createDraft(
    userId: string,
    dto:
      CreateOrganizationCreationRequestDto,
  ): Promise<CreateOrganizationCreationRequestResponseDto> {
    const payload:
      CreateOrganizationCreationRequestPayload = {
        userId,

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
      await firstValueFrom(
        this.organizationKafkaService.send<
          CreateOrganizationCreationRequestKafkaResponse,
          CreateOrganizationCreationRequestPayload
        >(
          ORGANIZATION_CREATION_REQUEST_PATTERNS
            .CREATE_DRAFT,

          payload,
        ),
      );

    return {
      request: {
        id:
          result.request.id,

        name:
          result.request.name,

        slug:
          result.request.slug,

        description:
          result.request.description,

        legalName:
          result.request.legalName,

        registrationCountryCode:
          result.request.registrationCountryCode,

        registrationNumber:
          result.request.registrationNumber,

        taxId:
          result.request.taxId,

        websiteUrl:
          result.request.websiteUrl,

        contactEmail:
          result.request.contactEmail,

        timeZone:
          result.request.timeZone,

        status:
          result.request.status,

        organizationId:
          result.request.organizationId,

        submittedAt:
          result.request.submittedAt,

        reviewedAt:
          result.request.reviewedAt,

        cancelledAt:
          result.request.cancelledAt,

        reviewComment:
          result.request.reviewComment,

        createdAt:
          result.request.createdAt,

        updatedAt:
          result.request.updatedAt,
      },
    };
  }

  async getMy(
    userId: string,
  ): Promise<GetMyOrganizationCreationRequestsResponseDto> {
    const payload:
      GetMyOrganizationCreationRequestsPayload = {
        userId,
      };

    return firstValueFrom(
      this.organizationKafkaService.send<
        GetMyOrganizationCreationRequestsKafkaResponse,
        GetMyOrganizationCreationRequestsPayload
      >(
        ORGANIZATION_CREATION_REQUEST_PATTERNS
          .GET_MY,

        payload,
      ),
    );
  }

  async updateDraft(
    userId: string,
    requestId: string,
    dto:
      UpdateOrganizationCreationRequestDto,
  ): Promise<UpdateOrganizationCreationRequestResponseDto> {
    const payload:
      UpdateOrganizationCreationRequestPayload = {
        userId,
        requestId,

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

    return firstValueFrom(
      this.organizationKafkaService.send<
        UpdateOrganizationCreationRequestKafkaResponse,
        UpdateOrganizationCreationRequestPayload
      >(
        ORGANIZATION_CREATION_REQUEST_PATTERNS
          .UPDATE_DRAFT,

        payload,
      ),
    );
  }

  async submit(
    userId: string,
    requestId: string,
  ): Promise<SubmitOrganizationCreationRequestResponseDto> {
    const payload:
      SubmitOrganizationCreationRequestPayload = {
        userId,
        requestId,
      };

    return firstValueFrom(
      this.organizationKafkaService.send<
        SubmitOrganizationCreationRequestKafkaResponse,
        SubmitOrganizationCreationRequestPayload
      >(
        ORGANIZATION_CREATION_REQUEST_PATTERNS
          .SUBMIT,

        payload,
      ),
    );
  }

  async deleteDraft(
    userId: string,
    requestId: string,
  ): Promise<void> {
    const payload:
      DeleteOrganizationCreationRequestDraftPayload = {
        userId,
        requestId,
      };

    await firstValueFrom(
      this.organizationKafkaService.send<
        CommandAcknowledgement,
        DeleteOrganizationCreationRequestDraftPayload
      >(
        ORGANIZATION_CREATION_REQUEST_PATTERNS
          .DELETE_DRAFT,

        payload,
      ),
    );
  }

  async cancel(
    userId: string,
    requestId: string,
  ): Promise<CancelOrganizationCreationRequestResponseDto> {
    const payload:
      CancelOrganizationCreationRequestPayload = {
        userId,
        requestId,
      };
    
    return firstValueFrom(
      this.organizationKafkaService.send<
        CancelOrganizationCreationRequestKafkaResponse,
        CancelOrganizationCreationRequestPayload
      >(
        ORGANIZATION_CREATION_REQUEST_PATTERNS
          .CANCEL,
      
        payload,
      ),
    );
  }
}