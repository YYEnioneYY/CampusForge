import {
  Controller,
} from '@nestjs/common';

import {
  MessagePattern,
  Payload,
} from '@nestjs/microservices';

import {
  EDUCATION_PATTERNS,
} from '../kafka/patterns/education-patterns';

import {
  GetMyEducationsDto,
} from './dto/get-my-educations.dto';

import type {
  GetMyEducationsResponse,
} from './types/get-my-educations-response.type';

import {
  EducationsService,
} from './educations.service';

import {
  CreateEducationDto,
} from './dto/create-education.dto';

import type {
  CreateEducationResponse,
} from './types/create-education-response.type';

@Controller()
export class EducationsController {
  constructor(
    private readonly educationsService: EducationsService,
  ) {}

  @MessagePattern(EDUCATION_PATTERNS.GET_MY)
  getMyEducations(
    @Payload()
    dto: GetMyEducationsDto,
  ): Promise<GetMyEducationsResponse> {
    return this.educationsService.getMyEducations(dto);
  }

  @MessagePattern(EDUCATION_PATTERNS.CREATE)
  createEducation(
    @Payload()
    dto: CreateEducationDto,
  ): Promise<CreateEducationResponse> {
    return this.educationsService.createEducation(dto);
  }
}