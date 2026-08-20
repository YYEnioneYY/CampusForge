import { Module } from '@nestjs/common';
import {
  ConfigService,
} from '@nestjs/config';

import {
  S3Client,
} from '@aws-sdk/client-s3';

import {
  S3_INTERNAL_CLIENT,
  S3_UPLOAD_CLIENT,
} from './storage.constants';

import {
  StorageService,
} from './storage.service';

@Module({
  providers: [
    {
      provide: S3_INTERNAL_CLIENT,

      inject: [
        ConfigService,
      ],

      useFactory: (
        configService: ConfigService,
      ) => {
        return new S3Client({
          endpoint:
            configService.getOrThrow<string>(
              'S3_INTERNAL_ENDPOINT',
            ),

          region:
            configService.getOrThrow<string>(
              'S3_REGION',
            ),

          credentials: {
            accessKeyId:
              configService.getOrThrow<string>(
                'S3_ACCESS_KEY',
              ),

            secretAccessKey:
              configService.getOrThrow<string>(
                'S3_SECRET_KEY',
              ),
          },

          forcePathStyle: true,
        });
      },
    },

    {
      provide: S3_UPLOAD_CLIENT,

      inject: [
        ConfigService,
      ],

      useFactory: (
        configService: ConfigService,
      ) => {
        return new S3Client({
          endpoint:
            configService.getOrThrow<string>(
              'S3_UPLOAD_PUBLIC_ENDPOINT',
            ),

          region:
            configService.getOrThrow<string>(
              'S3_REGION',
            ),

          credentials: {
            accessKeyId:
              configService.getOrThrow<string>(
                'S3_ACCESS_KEY',
              ),

            secretAccessKey:
              configService.getOrThrow<string>(
                'S3_SECRET_KEY',
              ),
          },

          forcePathStyle: true,
        });
      },
    },

    StorageService,
  ],

  exports: [
    StorageService,
  ],
})
export class StorageModule {}