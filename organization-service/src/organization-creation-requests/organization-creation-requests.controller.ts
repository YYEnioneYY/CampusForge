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

@Controller()
export class OrganizationCreationRequestsController {
  constructor(
    private readonly service:
      OrganizationCreationRequestsService,
  ) {}

  @MessagePattern(
    ORGANIZATION_CREATION_REQUEST_PATTERNS
      .CREATE_DRAFT,
  )
  createDraft(
    @Payload()
    dto:
      CreateOrganizationCreationRequestDto,
  ): Promise<CreateOrganizationCreationRequestResponse> {
    return this.service
      .createDraft(dto);
  }
}