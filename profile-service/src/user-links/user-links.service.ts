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

import {
  validateUserLinkUrl,
} from './utils/validate-user-link-url';

import { UpdateUserLinkDto } from './dto/update-user-link.dto';
import { UpdateUserLinkResponse } from './types/update-user-link-response.type';

import { DeleteUserLinkDto } from './dto/delete-user-link.dto';
import type { DeleteUserLinkResponse } from './types/delete-user-link-response.type';

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
    validateUserLinkUrl(
      dto.type,
      dto.url,
    );

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

  async updateUserLink(
    dto: UpdateUserLinkDto,
  ): Promise<UpdateUserLinkResponse> {
    const hasChanges =
      dto.type !== undefined ||
      dto.url !== undefined ||
      dto.title !== undefined;

    if (!hasChanges) {
      throwRpcError(
        RpcErrorCode.VALIDATION_ERROR,
        'At least one field must be provided',
      );
    }

    const currentLink = await this.userLinksRepository.findByIdForUser(
      dto.userId,
      dto.id,
    );

    if (!currentLink) {
      throwRpcError(
        RpcErrorCode.USER_LINK_NOT_FOUND,
        'User link not found',
      );
    }

    const nextType =
      dto.type ??
      currentLink.type;

    const nextUrl =
      dto.url ??
      currentLink.url;

    validateUserLinkUrl(
      nextType,
      nextUrl,
    );

    const updatedLink =
      await this.userLinksRepository
        .updateForUser(
          dto.userId,
          {
            id:
              dto.id,

            type:
              dto.type,

            url:
              dto.url,

            title:
              dto.title,
          },
        );

    if (!updatedLink) {
      throwRpcError(
        RpcErrorCode.USER_LINK_NOT_FOUND,
        'User link not found',
      );
    }

    return {
      link: updatedLink,
    };
  }

  async deleteUserLink(
    dto: DeleteUserLinkDto,
  ): Promise<DeleteUserLinkResponse> {
    const deleted = await this.userLinksRepository.deleteForUser(
      dto.userId,
      dto.id,
    );

    if (!deleted) {
      throwRpcError(
        RpcErrorCode.USER_LINK_NOT_FOUND,
        'User link not found',
      );
    }

    return {
      success: true,
    };
  }
}