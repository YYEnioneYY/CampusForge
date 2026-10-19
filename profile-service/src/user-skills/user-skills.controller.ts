import {
  Controller,
} from '@nestjs/common';

import {
  MessagePattern,
  Payload,
} from '@nestjs/microservices';

import {
  USER_SKILL_PATTERNS,
} from '../kafka/patterns/user-skill-patterns';

import {
  CreateUserSkillsDto,
} from './dto/create-user-skills.dto';

import {
  UserSkillsService,
} from './user-skills.service';

import type {
  CreateUserSkillsResponse,
} from './types/create-user-skills-response.type';

@Controller()
export class UserSkillsController {
  constructor(
    private readonly userSkillsService: UserSkillsService,
  ) {}

  @MessagePattern(USER_SKILL_PATTERNS.CREATE)
  createUserSkills(
    @Payload()
    dto: CreateUserSkillsDto,
  ): Promise<CreateUserSkillsResponse> {
    return this.userSkillsService.createUserSkills(dto);
  }
}