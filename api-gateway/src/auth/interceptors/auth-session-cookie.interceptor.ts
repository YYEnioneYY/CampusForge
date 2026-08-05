import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  map,
  type Observable,
} from 'rxjs';

import { AuthCookieService } from '../services/auth-cookie.service';

type AuthSessionControllerResult<TBody> = {
  body: TBody;

  refreshToken: {
    value: string;
    expiresAt: Date;
  };
};

@Injectable()
export class AuthSessionCookieInterceptor
  implements
    NestInterceptor<
      AuthSessionControllerResult<unknown>,
      unknown
    >
{
  constructor(
    private readonly authCookieService:
      AuthCookieService,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<
      AuthSessionControllerResult<unknown>
    >,
  ): Observable<unknown> {
    const response =
      context
        .switchToHttp()
        .getResponse<Response>();

    return next.handle().pipe(
      map((result) => {
        if (
          !result ||
          typeof result !== 'object' ||
          !result.refreshToken ||
          typeof result.refreshToken.value !==
            'string' ||
          !(
            result.refreshToken.expiresAt
            instanceof Date
          ) ||
          Number.isNaN(
            result.refreshToken.expiresAt.getTime(),
          )
        ) {
          throw new InternalServerErrorException(
            'Auth controller returned an invalid session result',
          );
        }

        this.authCookieService.setRefreshToken(
          response,
          result.refreshToken.value,
          result.refreshToken.expiresAt,
        );

        return result.body;
      }),
    );
  }
}