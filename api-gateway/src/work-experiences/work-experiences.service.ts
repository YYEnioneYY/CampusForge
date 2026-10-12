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
  WORK_EXPERIENCE_PATTERNS,
} from '../kafka/patterns/work-experience-patterns';

import {
  GetMyWorkExperiencesResponseDto,
} from './dto/get-my-work-experiences-response.dto';

import type {
  GetMyWorkExperiencesKafkaResponse,
  GetMyWorkExperiencesPayload,
} from './types/get-my-work-experiences.types';

@Injectable()
export class WorkExperiencesService {
  constructor(
    private readonly profileKafkaService:
      ProfileKafkaService,
  ) {}

  async getMyWorkExperiences(
    userId: string,
  ): Promise<GetMyWorkExperiencesResponseDto> {
    const payload:
      GetMyWorkExperiencesPayload = {
        userId,
      };

    const result =
      await firstValueFrom(
        this.profileKafkaService.send<
          GetMyWorkExperiencesKafkaResponse,
          GetMyWorkExperiencesPayload
        >(
          WORK_EXPERIENCE_PATTERNS.GET_MY,
          payload,
        ),
      );

    return {
      workExperiences:
        result.workExperiences.map(
          (experience) => ({
            id:
              experience.id,

            company:
              experience.company,

            position:
              experience.position,

            description:
              experience.description,

            startedAt:
              experience.startedAt,

            endedAt:
              experience.endedAt,

            isCurrent:
              experience.isCurrent,
          }),
        ),
    };
  }
}