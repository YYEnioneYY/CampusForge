import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isUUID } from 'class-validator';
import type {
  CookieOptions,
  Request,
  Response,
} from 'express';
import { randomUUID } from 'node:crypto';

import { AUTH_COOKIE_NAMES } from './constants/auth-cookie.constants';

@Injectable()
export class AuthCookieService {
  private readonly refreshCookieName =
    AUTH_COOKIE_NAMES.refreshToken;
  
  private readonly deviceIdCookieName =
    AUTH_COOKIE_NAMES.deviceId;

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
        ...this.getAuthCookieOptions(),
        expires: expiresAt,
      },
    );
  }

  getRefreshToken(
    request: Request,
  ): string | null {
    const value =
      request.cookies?.[
        this.refreshCookieName
      ];

    return typeof value === 'string' &&
      value.length > 0
      ? value
      : null;
  }

  clearRefreshToken(
    response: Response,
  ): void {
    response.clearCookie(
      this.refreshCookieName,
      this.getAuthCookieOptions(),
    );
  }

  getOrCreateDeviceId(
    request: Request,
    response: Response,
  ): string {
    const existingDeviceId =
      request.cookies?.[
        this.deviceIdCookieName
      ];

    if (
      typeof existingDeviceId === 'string' &&
      isUUID(existingDeviceId, '4')
    ) {
      return existingDeviceId;
    }

    const deviceId = randomUUID();

    const maxAgeDays =
      this.configService.getOrThrow<number>(
        'DEVICE_ID_COOKIE_MAX_AGE_DAYS',
      );

    response.cookie(
      this.deviceIdCookieName,
      deviceId,
      {
        ...this.getAuthCookieOptions(),
        maxAge:
          maxAgeDays *
          24 *
          60 *
          60 *
          1000,
      },
    );

    return deviceId;
  }

  private getAuthCookieOptions():
    CookieOptions {
    const secure =
      this.configService.getOrThrow<string>(
        'AUTH_COOKIE_SECURE',
      ) === 'true';

    return {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/api/auth',
    };
  }
}