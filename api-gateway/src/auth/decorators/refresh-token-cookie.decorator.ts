import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

import { AUTH_COOKIE_NAMES } from '../constants/auth-cookie.constants';

export const RefreshTokenCookie =
  createParamDecorator(
    (
      _data: unknown,
      context: ExecutionContext,
    ): string => {
      const request =
        context
          .switchToHttp()
          .getRequest<Request>();

      const value =
        request.cookies?.[
          AUTH_COOKIE_NAMES.refreshToken
        ];

      if (
        typeof value !== 'string' ||
        value.trim().length === 0
      ) {
        throw new UnauthorizedException(
          'Refresh token is missing',
        );
      }

      return value;
    },
  );