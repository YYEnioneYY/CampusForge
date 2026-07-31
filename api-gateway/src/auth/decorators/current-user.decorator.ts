import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

import type { AuthenticatedRequest } from '../types/authenticated-request.type';
import type { AuthenticatedUser } from '../types/authenticated-user.type';

export const CurrentUser =
  createParamDecorator(
    (
      _data: unknown,
      context: ExecutionContext,
    ): AuthenticatedUser => {
      const request =
        context
          .switchToHttp()
          .getRequest<AuthenticatedRequest>();

      if (!request.user) {
        throw new InternalServerErrorException(
          'Authenticated user was not initialized',
        );
      }

      return request.user;
    },
  );