import {
  Controller,
} from '@nestjs/common';

import {
  MessagePattern,
  Payload,
} from '@nestjs/microservices';

import {
  ACCESS_PATTERNS,
} from '../common/kafka/access-patterns';

import {
  AccessService,
} from './access.service';

import {
  AuthorizeDto,
} from './dto/authorize.dto';

import type {
  AuthorizeResponse,
} from './types/authorize-response.type';

@Controller()
export class AccessController {
  constructor(
    private readonly accessService:
      AccessService,
  ) {}

  @MessagePattern(ACCESS_PATTERNS.AUTHORIZE)
  authorize(
    @Payload()
    dto: AuthorizeDto,
  ): Promise<AuthorizeResponse> {
    return this.accessService.authorize(
      dto,
    );
  }
}