import { Module } from '@nestjs/common';
import { ClientContextService } from './client-context.service';
import { DeviceParserService } from './device-parser.service';

@Module({
  providers: [
    DeviceParserService,
    ClientContextService,
  ],
  exports: [
    ClientContextService,
  ],
})
export class HttpContextModule {}