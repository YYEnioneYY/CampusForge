import {
  Controller,
} from '@nestjs/common';

import {
  MessagePattern,
  Payload,
} from '@nestjs/microservices';

import {
  ORGANIZATION_CREATION_REQUEST_PATTERNS,
} from '../kafka/patterns/organization-creation-request-patterns';

import {
  CreateOrganizationCreationRequestDto,
} from './dto/create-organization-creation-request.dto';

import {
  OrganizationCreationRequestsService,
} from './organization-creation-requests.service';

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
  UpdateOrganizationCreationRequestResponse,
} from './types/update-organization-creation-request-response.type';

@Controller()
export class OrganizationCreationRequestsController {
  constructor(
    private readonly service:
      OrganizationCreationRequestsService,
  ) {}

  @MessagePattern(ORGANIZATION_CREATION_REQUEST_PATTERNS.CREATE_DRAFT)
  createDraft(
    @Payload()
    dto:
      CreateOrganizationCreationRequestDto,
  ): Promise<CreateOrganizationCreationRequestResponse> {
    return this.service
      .createDraft(dto);
  }

  @MessagePattern(ORGANIZATION_CREATION_REQUEST_PATTERNS.GET_MY)
  getMy(
    @Payload()
    dto:
      GetMyOrganizationCreationRequestsDto,
  ): Promise<GetMyOrganizationCreationRequestsResponse> {
    return this.service.getMy(dto);
  }

  @MessagePattern(ORGANIZATION_CREATION_REQUEST_PATTERNS.UPDATE_DRAFT)
  updateDraft(
    @Payload()
    dto:
      UpdateOrganizationCreationRequestDto,
  ): Promise<UpdateOrganizationCreationRequestResponse> {
    return this.service.updateDraft(dto);
  }
}