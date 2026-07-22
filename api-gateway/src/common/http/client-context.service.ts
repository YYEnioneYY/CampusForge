import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { DeviceParserService } from './device-parser.service';
import type { ClientContext } from './types/client-context.type';

@Injectable()
export class ClientContextService {
  constructor(
    private readonly deviceParserService:
      DeviceParserService,
  ) {}

  fromRequest(
    request: Request,
  ): ClientContext {
    const userAgent =
      this.normalizeUserAgent(
        request.get('user-agent'),
      );

    const ipAddress = this.normalizeIp(
      request.ip ??
        request.socket.remoteAddress,
    );

    return {
      ipAddress,
      userAgent,
      deviceName:
        this.deviceParserService.getDeviceName(
          userAgent,
        ),
    };
  }

  private normalizeUserAgent(
    userAgent: string | undefined,
  ): string | null {
    const normalized =
      userAgent?.trim();

    return normalized || null;
  }

  private normalizeIp(
    ipAddress:
      | string
      | null
      | undefined,
  ): string | null {
    const normalized =
      ipAddress?.trim();

    if (!normalized) {
      return null;
    }

    if (
      normalized.startsWith('::ffff:')
    ) {
      return normalized.slice(7);
    }

    return normalized;
  }
}