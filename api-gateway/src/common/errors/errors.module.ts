import { Module } from '@nestjs/common';
import { RpcErrorMapperService } from './rpc-error-mapper.service';

@Module({
  providers: [
    RpcErrorMapperService,
  ],
  exports: [
    RpcErrorMapperService,
  ],
})
export class ErrorsModule {}