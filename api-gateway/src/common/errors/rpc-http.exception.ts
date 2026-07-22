import {
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { RpcErrorPayload } from './rpc-error.type';

export class RpcHttpException
  extends HttpException
{
  constructor(
    status: HttpStatus,
    rpcError: RpcErrorPayload,
    cause?: unknown,
  ) {
    super(
      {
        statusCode: status,
        code: rpcError.code,
        message: rpcError.message,
      },
      status,
      cause === undefined
        ? undefined
        : { cause },
    );
  }
}