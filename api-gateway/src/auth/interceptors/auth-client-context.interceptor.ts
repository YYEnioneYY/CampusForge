import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type {
  Response,
} from 'express';
import type { Observable } from 'rxjs';

import { AuthCookieService } from '../services/auth-cookie.service';
import { ClientContextService } from '../../common/http/client-context.service';
import { AuthRequest } from '../types/auth-request.type';

@Injectable()
export class AuthClientContextInterceptor
  implements NestInterceptor
{
  constructor(
    private readonly authCookieService:
      AuthCookieService,

    private readonly clientContextService:
      ClientContextService,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    const httpContext =
      context.switchToHttp();

    const request =
      httpContext.getRequest<AuthRequest>();

    const response =
      httpContext.getResponse<Response>();

    const deviceId =
      this.authCookieService
        .getOrCreateDeviceId(
          request,
          response,
        );

    request.authClientContext =
      this.clientContextService.fromRequest(
        request,
        deviceId,
      );

    return next.handle();
  }
}