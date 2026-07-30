import {
  applyDecorators,
  UseInterceptors,
} from '@nestjs/common';

import { AuthClientContextInterceptor } from '../interceptors/auth-client-context.interceptor';
import { AuthSessionCookieInterceptor } from '../interceptors/auth-session-cookie.interceptor';

export function UseAuthSessionFlow() {
  return applyDecorators(
    UseInterceptors(
      AuthClientContextInterceptor,
      AuthSessionCookieInterceptor,
    ),
  );
}