import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { isUUID } from 'class-validator';

import type { AuthenticatedRequest } from '../types/authenticated-request.type';
import type { AuthenticatedUser } from '../types/authenticated-user.type';

@Injectable()
export class AccessTokenGuard
  implements CanActivate
{
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request =
      context
        .switchToHttp()
        .getRequest<AuthenticatedRequest>();

    const accessToken =
      this.extractBearerToken(request);

    if (!accessToken) {
      throw new UnauthorizedException(
        'Access token is missing',
      );
    }

    try {
      const secret =
        this.configService.getOrThrow<string>(
          'JWT_ACCESS_SECRET',
        );

      const payload =
        await this.jwtService.verifyAsync<AuthenticatedUser>(
          accessToken,
          {
            secret,
          },
        );

      if (
        typeof payload.sub !== 'string' ||
        typeof payload.sid !== 'string' ||
        !isUUID(payload.sub) ||
        !isUUID(payload.sid)
      ) {
        throw new UnauthorizedException(
          'Access token payload is invalid',
        );
      }

      request.user = payload;

      return true;
    } catch (error) {
      if (
        error instanceof
        UnauthorizedException
      ) {
        throw error;
      }

      throw new UnauthorizedException(
        'Access token is invalid or expired',
      );
    }
  }

  private extractBearerToken(
    request: AuthenticatedRequest,
  ): string | null {
    const authorization =
      request.headers.authorization;

    if (
      typeof authorization !== 'string'
    ) {
      return null;
    }

    const [scheme, token] =
      authorization.split(' ');

    if (
      scheme !== 'Bearer' ||
      !token
    ) {
      return null;
    }

    return token;
  }
}