import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { AccessTokenGuard } from 'src/common/guards/access-token.guard';

import {
  GetPublicProfileParamsDto,
} from '../profile/dto/get-public-profile-params.dto';

import {
  GetPublicUserSkillsResponseDto,
} from './dto/get-public-user-skills-response.dto';

import {
  UserSkillsService,
} from './user-skills.service';

@ApiTags('User skills')
@ApiBearerAuth('access-token')
@Controller('profile')
@UseGuards(AccessTokenGuard)
export class PublicUserSkillsController {
  constructor(
    private readonly userSkillsService: UserSkillsService,
  ) {}

  @Get(':username/skills')
  @ApiOperation({
    summary: 'Get user skills by username',
  })
  getPublicUserSkills(
    @Param()
    params: GetPublicProfileParamsDto,
  ): Promise<GetPublicUserSkillsResponseDto> {
    return this.userSkillsService.getPublicUserSkills(
      params.username,
    );
  }
}