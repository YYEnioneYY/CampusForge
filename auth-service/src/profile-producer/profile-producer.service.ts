import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { PROFILE_PATTERNS } from '../common/kafka/profile-patterns';

type UserRegisteredInput = {
  userId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
};

@Injectable()
export class ProfileProducerService implements OnModuleInit {
  constructor(
    @Inject('PROFILE_SERVICE')
    private readonly profileClient: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.profileClient.connect();
  }

  async userRegistered(input: UserRegisteredInput): Promise<void> {
    await lastValueFrom(
      this.profileClient.emit(PROFILE_PATTERNS.USER_REGISTERED, input),
    );
  }
}