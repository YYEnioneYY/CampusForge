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
}