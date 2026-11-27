import {
  Injectable,
} from '@nestjs/common';

import {
  firstValueFrom,
} from 'rxjs';

import {
  OrganizationCreationRequestStatus,
} from '../../common/enums/organization-creation-request-status.enum';

import {
  OrganizationKafkaService,
} from '../../kafka/organization-kafka.service';

import {
  ORGANIZATION_CREATION_REQUEST_PATTERNS,
} from '../../kafka/patterns/organization-creation-request-patterns';

import {
  GetOrganizationCreationRequestsQueryDto,
} from './dto/get-organization-creation-requests-query.dto';

import {
  GetOrganizationCreationRequestsResponseDto,
} from './dto/get-organization-creation-requests-response.dto';

import type {
  GetOrganizationCreationRequestsKafkaResponse,
  GetOrganizationCreationRequestsPayload,
} from './types/get-organization-creation-requests.types';

@Injectable()
export class OrganizationCreationRequestsService {
  constructor(
    private readonly organizationKafkaService:
      OrganizationKafkaService,
  ) {}

  async getRequests(
    query:
      GetOrganizationCreationRequestsQueryDto,
  ): Promise<GetOrganizationCreationRequestsResponseDto> {
    const payload:
      GetOrganizationCreationRequestsPayload = {
        page:
          query.page ?? 1,

        limit:
          query.limit ?? 20,

        status:
          query.status ??
          OrganizationCreationRequestStatus.SUBMITTED,
      };

    return firstValueFrom(
      this.organizationKafkaService.send<
        GetOrganizationCreationRequestsKafkaResponse,
        GetOrganizationCreationRequestsPayload
      >(
        ORGANIZATION_CREATION_REQUEST_PATTERNS
          .GET_MODERATION_LIST,

        payload,
      ),
    );
  }
}