import { Module } from '@nestjs/common';
import { UserLinksController } from './user-links.controller';
import { UserLinksService } from './user-links.service';
import { UserLinksRepository } from './user-links.repository';

@Module({
  controllers: [
    UserLinksController,
  ],

  providers: [
    UserLinksService,
    UserLinksRepository,
  ],

  exports: [
    UserLinksService,
  ],
})
export class UserLinksModule {}