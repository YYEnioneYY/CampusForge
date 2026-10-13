import {
  Controller,
} from '@nestjs/common';

import {
  MessagePattern,
  Payload,
} from '@nestjs/microservices';

import {
  WORK_EXPERIENCE_PATTERNS,
} from '../kafka/patterns/work-experience-patterns';

import {
  GetMyWorkExperiencesDto,
} from './dto/get-my-work-experiences.dto';

import type {
  GetMyWorkExperiencesResponse,
} from './types/get-my-work-experiences-response.type';

import {
  WorkExperiencesService,
} from './work-experiences.service';

import {
  CreateWorkExperienceDto,
} from './dto/create-work-experience.dto';

import type {
  CreateWorkExperienceResponse,
} from './types/create-work-experience-response.type';

@Controller()
export class WorkExperiencesController {
  constructor(
    private readonly workExperiencesService: WorkExperiencesService,
  ) {}

  @MessagePattern(WORK_EXPERIENCE_PATTERNS.GET_MY)
  getMyWorkExperiences(
    @Payload()
    dto: GetMyWorkExperiencesDto,
  ): Promise<GetMyWorkExperiencesResponse> {
    return this.workExperiencesService.getMyWorkExperiences(dto);
  }

  @MessagePattern(WORK_EXPERIENCE_PATTERNS.CREATE)
  createWorkExperience(
    @Payload()
    dto: CreateWorkExperienceDto,
  ): Promise<CreateWorkExperienceResponse> {
    return this.workExperiencesService.createWorkExperience(dto);
  }
}