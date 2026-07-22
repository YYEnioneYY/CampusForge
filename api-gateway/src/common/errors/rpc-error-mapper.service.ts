import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { TimeoutError } from 'rxjs';
import { RpcErrorCode } from './rpc-error-code';
import { RpcHttpException } from './rpc-http.exception';
import type { RpcErrorPayload } from './rpc-error.type';

type UnknownRecord = Record<string, unknown>;

@Injectable()
export class RpcErrorMapperService {
  toHttpException(
    error: unknown,
  ): HttpException {
    if (error instanceof HttpException) {
      return error;
    }

    if (error instanceof TimeoutError) {
      return new HttpException(
        {
          statusCode:
            HttpStatus.GATEWAY_TIMEOUT,
          code: 'UPSTREAM_TIMEOUT',
          message:
            'Auth service did not respond in time',
        },
        HttpStatus.GATEWAY_TIMEOUT,
        { cause: error },
      );
    }

    const rpcError =
      this.extractRpcError(error);

    if (rpcError) {
      return new RpcHttpException(
        this.getHttpStatus(rpcError.code),
        rpcError,
        error,
      );
    }

    if (this.isTransportError(error)) {
      return new HttpException(
        {
          statusCode:
            HttpStatus.SERVICE_UNAVAILABLE,
          code: 'AUTH_SERVICE_UNAVAILABLE',
          message:
            'Auth service is temporarily unavailable',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
        { cause: error },
      );
    }

    return new HttpException(
      {
        statusCode: HttpStatus.BAD_GATEWAY,
        code: 'INVALID_UPSTREAM_RESPONSE',
        message:
          'Auth service returned an unexpected error',
      },
      HttpStatus.BAD_GATEWAY,
      { cause: error },
    );
  }

  private getHttpStatus(
    code: string,
  ): HttpStatus {
    switch (code) {
      case RpcErrorCode.USER_ALREADY_EXISTS:
      case RpcErrorCode.EMAIL_ALREADY_VERIFIED:
        return HttpStatus.CONFLICT;

      case RpcErrorCode.INVALID_CREDENTIALS:
      case RpcErrorCode.INVALID_REFRESH_TOKEN:
        return HttpStatus.UNAUTHORIZED;

      case RpcErrorCode.USER_BLOCKED:
      case RpcErrorCode.USER_DELETED:
      case RpcErrorCode.FORBIDDEN:
        return HttpStatus.FORBIDDEN;

      case RpcErrorCode.USER_NOT_FOUND:
      case RpcErrorCode.SESSION_NOT_FOUND:
        return HttpStatus.NOT_FOUND;

      case RpcErrorCode.EMAIL_VERIFICATION_RESEND_TOO_SOON:
        return HttpStatus.TOO_MANY_REQUESTS;

      case RpcErrorCode.INVALID_CURRENT_PASSWORD:
      case RpcErrorCode.INVALID_EMAIL_VERIFICATION_TOKEN:
      case RpcErrorCode.INVALID_PASSWORD_RESET_TOKEN:
      case RpcErrorCode.INVALID_ACCOUNT_RESTORE_TOKEN:
      case RpcErrorCode.VALIDATION_ERROR:
        return HttpStatus.BAD_REQUEST;

      case RpcErrorCode.INTERNAL_ERROR:
        return HttpStatus.BAD_GATEWAY;

      default:
        return HttpStatus.BAD_GATEWAY;
    }
  }

  private extractRpcError(
    error: unknown,
  ): RpcErrorPayload | null {
    const root = this.toRecord(error);

    const candidates: unknown[] = [
      error,
      root?.error,
      root?.response,
      root?.cause,
    ];

    for (const candidate of candidates) {
      const record = this.toRecord(candidate);

      if (!record) {
        continue;
      }

      const code = record.code;
      const message =
        this.normalizeMessage(record.message);

      if (
        typeof code === 'string' &&
        message
      ) {
        return {
          code,
          message,
        };
      }
    }

    return null;
  }

  private normalizeMessage(
    message: unknown,
  ): string | null {
    if (typeof message === 'string') {
      const normalized = message.trim();

      return normalized || null;
    }

    if (
      Array.isArray(message) &&
      message.every(
        (item) => typeof item === 'string',
      )
    ) {
      return message.join(', ');
    }

    return null;
  }

  private toRecord(
    value: unknown,
  ): UnknownRecord | null {
    if (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value)
    ) {
      return value as UnknownRecord;
    }

    if (typeof value !== 'string') {
      return null;
    }

    try {
      const parsed: unknown =
        JSON.parse(value);

      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        !Array.isArray(parsed)
      ) {
        return parsed as UnknownRecord;
      }
    } catch {
      return null;
    }

    return null;
  }

  private isTransportError(
    error: unknown,
  ): boolean {
    const record = this.toRecord(error);

    const parts = [
      record?.name,
      record?.code,
      record?.message,
      error instanceof Error
        ? error.name
        : null,
      error instanceof Error
        ? error.message
        : null,
    ];

    const text = parts
      .filter(
        (part): part is string =>
          typeof part === 'string',
      )
      .join(' ')
      .toLowerCase();

    return [
      'kafkajs',
      'econnrefused',
      'enotfound',
      'ehostunreach',
      'broker not available',
      'connection error',
      'connection closed',
    ].some((marker) =>
      text.includes(marker),
    );
  }
}