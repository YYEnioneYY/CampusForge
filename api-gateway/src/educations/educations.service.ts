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

import {
  CreateEducationDto,
} from './dto/create-education.dto';

import {
  CreateEducationResponseDto,
} from './dto/create-education-response.dto';

import type {
  CreateEducationKafkaResponse,
  CreateEducationPayload,
} from './types/create-education.types';

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

  async createEducation(
    userId: string,
    dto: CreateEducationDto,
  ): Promise<CreateEducationResponseDto> {
    const payload:
      CreateEducationPayload = {
        userId,
      
        institution:
          dto.institution,
      
        degree:
          dto.degree,
      
        fieldOfStudy:
          dto.fieldOfStudy,
      
        description:
          dto.description,
      
        startedAt:
          dto.startedAt,
      
        endedAt:
          dto.endedAt,
      
        isCurrent:
          dto.isCurrent,
      };
    
    const result =
      await firstValueFrom(
        this.profileKafkaService.send<
          CreateEducationKafkaResponse,
          CreateEducationPayload
        >(
          EDUCATION_PATTERNS.CREATE,
          payload,
        ),
      );
    
    return {
      education: {
        id:
          result.education.id,
      
        institution:
          result.education.institution,
      
        degree:
          result.education.degree,
      
        fieldOfStudy:
          result.education.fieldOfStudy,
      
        description:
          result.education.description,
      
        startedAt:
          result.education.startedAt,
      
        endedAt:
          result.education.endedAt,
      
        isCurrent:
          result.education.isCurrent,
      },
    };
  }
}