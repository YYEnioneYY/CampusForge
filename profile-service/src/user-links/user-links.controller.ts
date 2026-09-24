import {
  Controller,
} from '@nestjs/common';

import {
  MessagePattern,
  Payload,
} from '@nestjs/microservices';

import { UserLinksService } from './user-links.service';

import {
  USER_LINK_PATTERNS,
} from '../kafka/patterns/user-link-patterns';

import { GetMyLinksDto } from './dto/get-my-links.dto';
import type { GetMyLinksResponse } from './types/get-my-links-response.type';

@Controller()
export class UserLinksController {
  constructor(
    private readonly userLinksService: UserLinksService,
  ) {}

  @MessagePattern(USER_LINK_PATTERNS.GET_MY)
  getMyLinks(
    @Payload()
    dto: GetMyLinksDto,
  ): Promise<GetMyLinksResponse> {
    return this.userLinksService.getMyLinks(dto);
  }
}