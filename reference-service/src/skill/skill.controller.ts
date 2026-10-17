import {
  Controller,
} from '@nestjs/common';

import {
  MessagePattern,
  Payload,
} from '@nestjs/microservices';

import {
  REFERENCE_PATTERNS,
} from '../kafka/patterns/reference-patterns';

import {
  SearchSkillsDto,
} from './dto/search-skills.dto';

import {
  SkillService,
} from './skill.service';

import type {
  SearchSkillsResponse,
} from './types/search-skills-response.type';

@Controller()
export class SkillController {
  constructor(
    private readonly skillService: SkillService,
  ) {}

  @MessagePattern(REFERENCE_PATTERNS.SEARCH_SKILLS)
  searchSkills(
    @Payload()
    dto: SearchSkillsDto,
  ): Promise<SearchSkillsResponse> {
    return this.skillService.searchSkills(
      dto,
    );
  }
}