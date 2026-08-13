import {
  Injectable,
} from '@nestjs/common';

import { AccessScopeType } from '../generated/prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { RpcErrorCode } from '../common/rpc/rpc-error-code';

import { throwRpcError } from '../common/rpc/throw-rpc-error';

import { AuthorizeDto } from './dto/authorize.dto';
import { AuthorizeResponse } from './types/authorize-response.type';

@Injectable()
export class AccessService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async authorize(
    dto: AuthorizeDto,
  ): Promise<AuthorizeResponse> {
    const scopeKey =
      this.buildScopeKey(
        dto.scopeType,
        dto.scopeId,
      );

    const assignment =
      await this.prisma.roleAssignment.findFirst({
        where: {
          userId: dto.actorUserId,

          scopeType: dto.scopeType,

          scopeKey,

          role: {
            scopeType: dto.scopeType,

            permissions: {
              some: {
                permission: {
                  code: dto.permission,

                  scopeType:
                    dto.scopeType,
                },
              },
            },
          },
        },

        select: {
          id: true,
        },
      });

    return {
      allowed: assignment !== null,
    };
  }

  private buildScopeKey(
    scopeType: AccessScopeType,
    scopeId?: string,
  ): string {
    if (
      scopeType ===
      AccessScopeType.GLOBAL
    ) {
      if (scopeId) {
        throwRpcError(
          RpcErrorCode.INVALID_SCOPE,
          'scopeId must not be provided for GLOBAL scope',
        );
      }

      return 'GLOBAL';
    }

    if (!scopeId) {
      throwRpcError(
        RpcErrorCode.INVALID_SCOPE,
        `scopeId is required for ${scopeType} scope`,
      );
    }

    return `${scopeType}:${scopeId}`;
  }
}