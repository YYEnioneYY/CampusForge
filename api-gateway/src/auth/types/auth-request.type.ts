import type { Request } from 'express';
import type { ClientContext } from '../../common/http/types/client-context.type';

export type AuthRequest = Request & {
  authClientContext?: ClientContext;
};