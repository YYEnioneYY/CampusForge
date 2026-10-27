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
  EDUCATION_PATTERNS,
} from '../kafka/patterns/education-patterns';

import {
  GetMyEducationsResponseDto,
} from './dto/get-my-educations-response.dto';

import type {
  GetMyEducationsKafkaResponse,
  GetMyEducationsPayload,
} from './types/get-my-educations.types';

@Injectable()
export class EducationsService {
  constructor(
    private readonly profileKafkaService:  ProfileKafkaService,
  ) {}

  async getMyEducations(
    userId: string,
  ): Promise<GetMyEducationsResponseDto> {
    const payload: GetMyEducationsPayload = {
      userId,
    };

    const result =
      await firstValueFrom(
        this.profileKafkaService.send<
          GetMyEducationsKafkaResponse,
          GetMyEducationsPayload
        >(
          EDUCATION_PATTERNS.GET_MY,
          payload,
        ),
      );

    return {
      educations:
        result.educations.map(
          (education) => ({
            id:
              education.id,

            institution:
              education.institution,

            degree:
              education.degree,

            fieldOfStudy:
              education.fieldOfStudy,

            description:
              education.description,

            startedAt:
              education.startedAt,

            endedAt:
              education.endedAt,

            isCurrent:
              education.isCurrent,
          }),
        ),
    };
  }
}