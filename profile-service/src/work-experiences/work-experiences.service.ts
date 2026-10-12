import {
  Injectable,
} from '@nestjs/common';

import {
  RpcErrorCode,
} from '../common/rpc/rpc-error-code';

import {
  throwRpcError,
} from '../common/rpc/throw-rpc-error';

import {
  GetMyWorkExperiencesDto,
} from './dto/get-my-work-experiences.dto';

import type {
  GetMyWorkExperiencesResponse,
} from './types/get-my-work-experiences-response.type';

import {
  WorkExperiencesRepository,
} from './work-experiences.repository';

@Injectable()
export class WorkExperiencesService {
  constructor(
    private readonly workExperiencesRepository:
      WorkExperiencesRepository,
  ) {}

  async getMyWorkExperiences(
    dto: GetMyWorkExperiencesDto,
  ): Promise<GetMyWorkExperiencesResponse> {
    const profile =
      await this.workExperiencesRepository
        .findByUserId(
          dto.userId,
        );

    if (!profile) {
      throwRpcError(
        RpcErrorCode.PROFILE_NOT_FOUND,
        'Profile not found',
      );
    }

    return {
      workExperiences:
        profile.workExperiences.map(
          (experience) => ({
            id:
              experience.id,

            company:
              experience.company,

            position:
              experience.position,

            description:
              experience.description,

            startedAt:
              this.formatDate(
                experience.startedAt,
              ),

            endedAt:
              experience.endedAt
                ? this.formatDate(
                    experience.endedAt,
                  )
                : null,

            isCurrent:
              experience.isCurrent,
          }),
        ),
    };
  }

  private formatDate(
    value: Date,
  ): string {
    return value
      .toISOString()
      .slice(0, 10);
  }
}