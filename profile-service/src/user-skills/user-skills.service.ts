import {
  Injectable,
} from '@nestjs/common';

import {
  firstValueFrom,
} from 'rxjs';

import {
  RpcErrorCode,
} from '../common/rpc/rpc-error-code';

import {
  throwRpcError,
} from '../common/rpc/throw-rpc-error';

import {
  ReferenceKafkaService,
} from '../kafka/reference-kafka.service';

import {
  REFERENCE_PATTERNS,
} from '../kafka/patterns/reference-patterns';

import {
  CreateUserSkillsDto,
} from './dto/create-user-skills.dto';

import {
  MAX_USER_SKILLS,
} from './user-skills.constants';

import {
  UserSkillsRepository,
} from './user-skills.repository';

import type {
  CreateUserSkillsResponse,
} from './types/create-user-skills-response.type';

import type {
  GetReferenceSkillsPayload,
  GetReferenceSkillsResponse,
} from './types/reference-skills-response.type';

@Injectable()
export class UserSkillsService {
  constructor(
    private readonly userSkillsRepository:
      UserSkillsRepository,

    private readonly referenceKafkaService:
      ReferenceKafkaService,
  ) {}

  async createUserSkills(
    dto: CreateUserSkillsDto,
  ): Promise<CreateUserSkillsResponse> {
    const referenceResponse =
      await firstValueFrom(
        this.referenceKafkaService.send<
          GetReferenceSkillsResponse,
          GetReferenceSkillsPayload
        >(
          REFERENCE_PATTERNS.GET_SKILLS_BY_IDS,
          {
            skillIds:
              dto.skillIds,
          },
        ),
      );

    if (
      referenceResponse.items.length !==
      dto.skillIds.length
    ) {
      throwRpcError(
        RpcErrorCode.SKILL_NOT_FOUND,
        'One or more skills were not found',
      );
    }

    const result =
      await this.userSkillsRepository
        .createManyForUser(
          dto.userId,

          referenceResponse.items.map(
            (skill) => ({
              skillId:
                skill.id,

              skillName:
                skill.name,

              skillSlug:
                skill.slug,
            }),
          ),

          MAX_USER_SKILLS,
        );

    if (
      result.status ===
      'profile_not_found'
    ) {
      throwRpcError(
        RpcErrorCode.PROFILE_NOT_FOUND,
        'Profile not found',
      );
    }

    if (
      result.status ===
      'already_exists'
    ) {
      throwRpcError(
        RpcErrorCode.USER_SKILL_ALREADY_EXISTS,
        'One or more skills are already added',
      );
    }

    if (
      result.status ===
      'limit_reached'
    ) {
      throwRpcError(
        RpcErrorCode.USER_SKILL_LIMIT_REACHED,
        `A maximum of ${MAX_USER_SKILLS} skills is allowed`,
      );
    }

    return {
      skills:
        result.skills.map(
          (skill) => ({
            id:
              skill.id,

            skillId:
              skill.skillId,

            name:
              skill.skillName,

            slug:
              skill.skillSlug,
          }),
        ),
    };
  }
}