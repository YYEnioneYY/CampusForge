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

import {
  DeleteUserSkillDto,
} from './dto/delete-user-skill.dto';

import type {
  DeleteUserSkillResponse,
} from './types/delete-user-skill-response.type';

import { GetPublicUserSkillsDto } from './dto/get-public-user-skills.dto';
import type { GetPublicUserSkillsResponse } from './types/get-public-user-skills-response.type';

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

  @MessagePattern(USER_SKILL_PATTERNS.DELETE)
  deleteUserSkill(
    @Payload()
    dto: DeleteUserSkillDto,
  ): Promise<DeleteUserSkillResponse> {
    return this.userSkillsService.deleteUserSkill(dto);
  }

  @MessagePattern(USER_SKILL_PATTERNS.GET_PUBLIC_BY_USERNAME)
  getPublicUserSkills(
    @Payload()
    dto: GetPublicUserSkillsDto,
  ): Promise<GetPublicUserSkillsResponse> {
    return this.userSkillsService.getPublicUserSkills(dto);
  }
}