import { ValidationError } from 'class-validator';
import { RpcException } from '@nestjs/microservices';
import { RpcErrorCode } from './rpc-error-code';

type RpcValidationError = {
  field: string;
  messages: string[];
};

export function rpcValidationExceptionFactory(
  errors: ValidationError[],
): RpcException {
  return new RpcException({
    code: RpcErrorCode.VALIDATION_ERROR,
    message: 'Validation failed',
    details: flattenValidationErrors(errors),
  });
}

function flattenValidationErrors(
  errors: ValidationError[],
  parentPath = '',
): RpcValidationError[] {
  return errors.flatMap((error) => {
    const fieldPath = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;

    const currentError: RpcValidationError[] = error.constraints
      ? [
          {
            field: fieldPath,
            messages: Object.values(error.constraints),
          },
        ]
      : [];

    const childErrors = error.children?.length
      ? flattenValidationErrors(error.children, fieldPath)
      : [];

    return [...currentError, ...childErrors];
  });
}