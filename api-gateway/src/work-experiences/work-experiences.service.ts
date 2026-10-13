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

import {
  CreateWorkExperienceDto,
} from './dto/create-work-experience.dto';

import {
  CreateWorkExperienceResponseDto,
} from './dto/create-work-experience-response.dto';

import type {
  CreateWorkExperienceKafkaResponse,
  CreateWorkExperiencePayload,
} from './types/create-work-experience.types';

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

  async createWorkExperience(
    userId: string,
    dto: CreateWorkExperienceDto,
  ): Promise<CreateWorkExperienceResponseDto> {
    const payload:
      CreateWorkExperiencePayload = {
        userId,
      
        company:
          dto.company,
      
        position:
          dto.position,
      
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
          CreateWorkExperienceKafkaResponse,
          CreateWorkExperiencePayload
        >(
          WORK_EXPERIENCE_PATTERNS.CREATE,
          payload,
        ),
      );
    
    return {
      workExperience: {
        id:
          result.workExperience.id,
      
        company:
          result.workExperience.company,
      
        position:
          result.workExperience.position,
      
        description:
          result.workExperience.description,
      
        startedAt:
          result.workExperience.startedAt,
      
        endedAt:
          result.workExperience.endedAt,
      
        isCurrent:
          result.workExperience.isCurrent,
      },
    };
  }
}