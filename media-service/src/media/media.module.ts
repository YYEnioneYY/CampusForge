import { Module } from '@nestjs/common';

import {
  StorageModule,
} from '../storage/storage.module';

import {
  MediaController,
} from './media.controller';

import {
  MediaRepository,
} from './media.repository';

import {
  MediaService,
} from './media.service';

@Module({
  imports: [
    StorageModule,
  ],

  controllers: [
    MediaController,
  ],

  providers: [
    MediaService,
    MediaRepository,
  ],
})
export class MediaModule {}