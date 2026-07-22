import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  CookieOptions,
  Response,
} from 'express';

@Injectable()
export class AuthCookieService {
  private readonly refreshCookieName =
    'refresh_token';

  constructor(
    private readonly configService:
      ConfigService,
  ) {}

  setRefreshToken(
    response: Response,
    refreshToken: string,
    expiresAt: Date,
  ): void {
    response.cookie(
      this.refreshCookieName,
      refreshToken,
      {
        ...this.getBaseOptions(),
        expires: expiresAt,
      },
    );
  }

  clearRefreshToken(
    response: Response,
  ): void {
    response.clearCookie(
      this.refreshCookieName,
      this.getBaseOptions(),
    );
  }

  private getBaseOptions(): CookieOptions {
    const secure =
      this.configService.get<string>(
        'AUTH_COOKIE_SECURE',
        'false',
      ) === 'true';
  
    return {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/api/auth',
    };
  }
}