import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { isUUID } from 'class-validator';

import { AccessRevocationCheckerService } from '../services/access-revocation-checker.service';
import type { AuthenticatedRequest } from '../types/authenticated-request.type';
import type { AuthenticatedUser } from '../types/authenticated-user.type';

@Injectable()
export class AccessTokenGuard
  implements CanActivate
{
  constructor(
    private readonly jwtService:
      JwtService,

    private readonly configService:
      ConfigService,

    private readonly accessRevocationChecker:
      AccessRevocationCheckerService,
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

    const payload =
      await this.verifyAccessToken(
        accessToken,
      );

    this.validatePayload(payload);

    await this.accessRevocationChecker
      .assertAccessAllowed(payload);

    request.user = payload;

    return true;
  }

  private async verifyAccessToken(
    accessToken: string,
  ): Promise<AuthenticatedUser> {
    try {
      const publicKey =
        Buffer.from(
          this.configService.getOrThrow<string>(
            'JWT_ACCESS_PUBLIC_KEY_BASE64',
          ),
          'base64',
        ).toString('utf8');
      
      return await this.jwtService
        .verifyAsync<AuthenticatedUser>(
          accessToken,
          {
            publicKey,
          
            algorithms: [
              'RS256',
            ],
          
            issuer:
              this.configService.getOrThrow<string>(
                'JWT_ACCESS_ISSUER',
              ),
            
            audience:
              this.configService.getOrThrow<string>(
                'JWT_ACCESS_AUDIENCE',
              ),
          },
        );
    } catch {
      throw new UnauthorizedException(
        'Access token is invalid or expired',
      );
    }
  }

  private validatePayload(
    payload: AuthenticatedUser,
  ): void {
    if (
      typeof payload.sub !== 'string' ||
      typeof payload.sid !== 'string' ||
      !isUUID(payload.sub) ||
      !isUUID(payload.sid) ||
      typeof payload.iat !== 'number' ||
      typeof payload.exp !== 'number'
    ) {
      throw new UnauthorizedException(
        'Access token payload is invalid',
      );
    }
  }

  private extractBearerToken(
    request: AuthenticatedRequest,
  ): string | null {
    const authorization =
      request.headers.authorization;

    if (typeof authorization !== 'string') {
      return null;
    }

    const [scheme, token] =
      authorization.trim().split(/\s+/);

    if (
      scheme?.toLowerCase() !== 'bearer' ||
      !token
    ) {
      return null;
    }

    return token;
  }
}