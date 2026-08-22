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
import { MediaEventProducerModule } from 'src/media-event-producer/media-event-producer.module';

@Module({
  imports: [
    StorageModule,
    MediaEventProducerModule,
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