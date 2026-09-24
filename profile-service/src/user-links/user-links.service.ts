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
  GetMyLinksDto,
} from './dto/get-my-links.dto';

import type {
  GetMyLinksResponse,
} from './types/get-my-links-response.type';

import {
  UserLinksRepository,
} from './user-links.repository';

import {
  CreateUserLinkDto,
} from './dto/create-user-link.dto';

import type {
  CreateUserLinkResponse,
} from './types/create-user-link-response.type';

import {
  MAX_USER_LINKS,
} from './user-links.constants';

@Injectable()
export class UserLinksService {
  constructor(
    private readonly userLinksRepository: UserLinksRepository,
  ) {}

  async getMyLinks(
    dto: GetMyLinksDto,
  ): Promise<GetMyLinksResponse> {
    const profile = await this.userLinksRepository.findByUserId(
      dto.userId,
    );

    if (!profile) {
      throwRpcError(
        RpcErrorCode.PROFILE_NOT_FOUND,
        'Profile not found',
      );
    }

    return {
      links: profile.links,
    };
  }

  async createUserLink(
    dto: CreateUserLinkDto,
  ): Promise<CreateUserLinkResponse> {
    const result =
      await this.userLinksRepository
        .createForUser(
          dto.userId,
          {
            type:
              dto.type,
          
            url:
              dto.url,
          
            title:
              dto.title,
          },
          MAX_USER_LINKS,
        );
      
    if (
      result.status ===
      'profile_not_found'
    ) {
      throwRpcError(
        RpcErrorCode.PROFILE_NOT_FOUND,
        'Profile not found',
      );
    }
  
    if (
      result.status ===
      'limit_reached'
    ) {
      throwRpcError(
        RpcErrorCode.USER_LINK_LIMIT_REACHED,
        `A maximum of ${MAX_USER_LINKS} links is allowed`,
      );
    }
  
    return {
      link:
        result.link,
    };
  }
}