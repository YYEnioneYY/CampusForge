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

import {
  UpdateEducationDto,
} from './dto/update-education.dto';

import type {
  UpdateEducationResponse,
} from './types/update-education-response.type';

import {
  DeleteEducationDto,
} from './dto/delete-education.dto';

import type {
  DeleteEducationResponse,
} from './types/delete-education-response.type';

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

  @MessagePattern(EDUCATION_PATTERNS.UPDATE)
  updateEducation(
    @Payload()
    dto: UpdateEducationDto,
  ): Promise<UpdateEducationResponse> {
    return this.educationsService.updateEducation(dto);
  }

  @MessagePattern(EDUCATION_PATTERNS.DELETE)
  deleteEducation(
    @Payload()
    dto: DeleteEducationDto,
  ): Promise<DeleteEducationResponse> {
    return this.educationsService.deleteEducation(dto);
  }
}