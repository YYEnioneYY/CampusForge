import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

import type { ClientContext } from '../../common/http/types/client-context.type';
import type { AuthRequest } from '../types/auth-request.type';

export const CurrentClientContext =
  createParamDecorator(
    (
      _data: unknown,
      context: ExecutionContext,
    ): ClientContext => {
      const request =
        context
          .switchToHttp()
          .getRequest<AuthRequest>();

      if (!request.authClientContext) {
        throw new InternalServerErrorException(
          'Auth client context was not initialized',
        );
      }

      return request.authClientContext;
    },
  );