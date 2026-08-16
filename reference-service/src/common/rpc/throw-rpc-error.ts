import { RpcException } from '@nestjs/microservices';
import { RpcErrorCode } from './rpc-error-code';

export function throwRpcError(
  code: RpcErrorCode,
  message: string,
): never {
  throw new RpcException({
    code,
    message,
  });
}