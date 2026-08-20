import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation';
import { StorageModule } from './storage/storage.module';
import { MediaModule } from './media/media.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    PrismaModule,
    StorageModule,
    MediaModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
