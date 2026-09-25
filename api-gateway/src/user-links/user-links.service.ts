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

import {
  CreateUserLinkDto,
} from './dto/create-user-link.dto';

import {
  CreateUserLinkResponseDto,
} from './dto/create-user-link-response.dto';

import type {
  CreateUserLinkKafkaResponse,
  CreateUserLinkPayload,
} from './types/create-user-link.types';

import {
  UpdateUserLinkDto,
} from './dto/update-user-link.dto';

import {
  UpdateUserLinkResponseDto,
} from './dto/update-user-link-response.dto';

import type {
  UpdateUserLinkKafkaResponse,
  UpdateUserLinkPayload,
} from './types/update-user-link.types';

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

  async createUserLink(
    userId: string,
    dto: CreateUserLinkDto,
  ): Promise<CreateUserLinkResponseDto> {
    const payload:
      CreateUserLinkPayload = {
        userId,

        type:
          dto.type,

        url:
          dto.url,

        title:
          dto.title,
      };

    const result =
      await firstValueFrom(
        this.profileKafkaService.send<
          CreateUserLinkKafkaResponse,
          CreateUserLinkPayload
        >(
          USER_LINK_PATTERNS.CREATE,
          payload,
        ),
      );

    return {
      link: {
        id:
          result.link.id,

        type:
          result.link.type,

        url:
          result.link.url,

        title:
          result.link.title,

        sortOrder:
          result.link.sortOrder,
      },
    };
  }

  async updateUserLink(
    userId: string,
    id: string,
    dto: UpdateUserLinkDto,
  ): Promise<UpdateUserLinkResponseDto> {
    const payload:
      UpdateUserLinkPayload = {
        id,
        userId,
      
        type:
          dto.type,
      
        url:
          dto.url,
      
        title:
          dto.title,
      };
    
    const result =
      await firstValueFrom(
        this.profileKafkaService.send<
          UpdateUserLinkKafkaResponse,
          UpdateUserLinkPayload
        >(
          USER_LINK_PATTERNS.UPDATE,
          payload,
        ),
      );
    
    return {
      link: {
        id:
          result.link.id,
      
        type:
          result.link.type,
      
        url:
          result.link.url,
      
        title:
          result.link.title,
      
        sortOrder:
          result.link.sortOrder,
      },
    };
  }
}