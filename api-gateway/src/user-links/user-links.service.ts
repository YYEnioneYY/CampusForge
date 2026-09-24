import {
  Injectable,
} from '@nestjs/common';

import {
  firstValueFrom,
} from 'rxjs';

import {
  ProfileKafkaService,
} from '../kafka/profile-kafka.service';

import {
  USER_LINK_PATTERNS,
} from '../kafka/patterns/user-link-patterns';

import {
  GetMyLinksResponseDto,
} from './dto/get-my-links-response.dto';

import type {
  GetMyLinksKafkaResponse,
  GetMyLinksPayload,
} from './types/get-my-links.types';

@Injectable()
export class UserLinksService {
  constructor(
    private readonly profileKafkaService: ProfileKafkaService,
  ) {}

  async getMyLinks(
    userId: string,
  ): Promise<GetMyLinksResponseDto> {
    const payload: GetMyLinksPayload = {
      userId,
    };

    const result =
      await firstValueFrom(
        this.profileKafkaService.send<
          GetMyLinksKafkaResponse,
          GetMyLinksPayload
        >(
          USER_LINK_PATTERNS.GET_MY,
          payload,
        ),
      );

    return {
      links:
        result.links.map(
          (link) => ({
            id: link.id,

            type: link.type,

            url: link.url,
            title: link.title,

            sortOrder: link.sortOrder,
          }),
        ),
    };
  }
}