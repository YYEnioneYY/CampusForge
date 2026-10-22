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
  USER_SKILL_PATTERNS,
} from '../kafka/patterns/user-skill-patterns';

import {
  CreateUserSkillsDto,
} from './dto/create-user-skills.dto';

import {
  CreateUserSkillsResponseDto,
} from './dto/create-user-skills-response.dto';

import type {
  CreateUserSkillsKafkaResponse,
  CreateUserSkillsPayload,
} from './types/create-user-skills.types';

import type {
  CommandAcknowledgement,
} from '../common/types/command-acknowledgement.type';

import type {
  DeleteUserSkillPayload,
} from './types/delete-user-skill.types';

import { GetPublicUserSkillsKafkaResponse } from './types/get-public-user-skills.types';
import type { GetPublicUserSkillsPayload } from './types/get-public-user-skills.types';
import { GetPublicUserSkillsResponseDto } from './dto/get-public-user-skills-response.dto';

@Injectable()
export class UserSkillsService {
  constructor(
    private readonly profileKafkaService:
      ProfileKafkaService,
  ) {}

  async createUserSkills(
    userId: string,
    dto: CreateUserSkillsDto,
  ): Promise<CreateUserSkillsResponseDto> {
    const payload:
      CreateUserSkillsPayload = {
        userId,

        skillIds:
          dto.skillIds,
      };

    const result =
      await firstValueFrom(
        this.profileKafkaService.send<
          CreateUserSkillsKafkaResponse,
          CreateUserSkillsPayload
        >(
          USER_SKILL_PATTERNS.CREATE,
          payload,
        ),
      );

    return {
      skills:
        result.skills.map(
          (skill) => ({
            id:
              skill.id,

            skillId:
              skill.skillId,

            name:
              skill.name,

            slug:
              skill.slug,
          }),
        ),
    };
  }

  async deleteUserSkill(
    userId: string,
    id: string,
  ): Promise<void> {
    const payload: DeleteUserSkillPayload = {
      id,
      userId,
    };

    await firstValueFrom(
      this.profileKafkaService.send<
        CommandAcknowledgement,
        DeleteUserSkillPayload
      >(
        USER_SKILL_PATTERNS.DELETE,
        payload,
      ),
    );
  }

  async getPublicUserSkills(
    username: string,
  ): Promise<GetPublicUserSkillsResponseDto> {
    const result =
      await firstValueFrom(
        this.profileKafkaService.send<
          GetPublicUserSkillsKafkaResponse,
          GetPublicUserSkillsPayload
        >(
          USER_SKILL_PATTERNS
            .GET_PUBLIC_BY_USERNAME,
          {
            username,
          },
        ),
      );

    return {
      skills: result.skills,
    };
  }
}