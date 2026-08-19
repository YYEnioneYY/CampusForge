import {
  Injectable,
} from '@nestjs/common';

import {
  firstValueFrom,
} from 'rxjs';

import {
  ProfileKafkaService,
} from '../kafka/profile-kafka.service';

import {
  PROFILE_PATTERNS,
} from '../kafka/patterns/profile-patterns';

import type {
  GetMyProfilePayload,
} from './types/get-my-profile-payload.type';

import type {
  GetMyProfileResponse,
} from './types/get-my-profile-response.type';

@Injectable()
export class ProfileService {
  constructor(
    private readonly profileKafkaService:
      ProfileKafkaService,
  ) {}

  getMyProfile(
    userId: string,
  ): Promise<GetMyProfileResponse> {
    const payload: GetMyProfilePayload = {
      userId,
    };

    return firstValueFrom(
      this.profileKafkaService.send<
        GetMyProfileResponse,
        GetMyProfilePayload
      >(
        PROFILE_PATTERNS.ME,
        payload,
      ),
    );
  }
}