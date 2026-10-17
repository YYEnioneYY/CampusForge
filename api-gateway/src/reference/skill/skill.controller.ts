import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';

import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import {
  SearchSkillsQueryDto,
} from './dto/search-skills-query.dto';

import {
  SearchSkillsResponseDto,
} from './dto/search-skills-response.dto';

import {
  SkillService,
} from './skill.service';

@ApiTags('Reference')
@Controller('reference/skills')
export class SkillController {
  constructor(
    private readonly skillService: SkillService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'Поиск доступных навыков',
  })
  searchSkills(
    @Query()
    dto: SearchSkillsQueryDto,
  ): Promise<SearchSkillsResponseDto> {
    return this.skillService.searchSkills(
      dto,
    );
  }
}