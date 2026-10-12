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
}