import { Injectable } from '@nestjs/common';
import UAParser from 'ua-parser-js';

@Injectable()
export class DeviceParserService {
  getDeviceName(
    userAgent: string | null,
  ): string | null {
    if (!userAgent) {
      return null;
    }

    const result =
      new UAParser(userAgent).getResult();

    const browserName = this.joinParts(
      result.browser.name,
      result.browser.major,
    );

    const deviceName = this.joinParts(
      result.device.vendor,
      result.device.model,
    );

    const osName = this.joinParts(
      result.os.name,
      result.os.version,
    );

    const platformName =
      deviceName || osName;

    if (browserName && platformName) {
      return `${browserName} on ${platformName}`;
    }

    return (
      browserName ||
      platformName ||
      'Unknown device'
    );
  }

  private joinParts(
    ...parts: Array<string | undefined>
  ): string {
    return parts
      .filter(
        (part): part is string =>
          typeof part === 'string' &&
          part.trim().length > 0,
      )
      .map((part) => part.trim())
      .join(' ');
  }
}