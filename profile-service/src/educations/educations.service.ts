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
  GetMyEducationsDto,
} from './dto/get-my-educations.dto';

import type {
  GetMyEducationsResponse,
} from './types/get-my-educations-response.type';

import {
  EducationsRepository,
} from './educations.repository';

@Injectable()
export class EducationsService {
  constructor(
    private readonly educationsRepository: EducationsRepository,
  ) {}

  async getMyEducations(
    dto: GetMyEducationsDto,
  ): Promise<GetMyEducationsResponse> {
    const profile =
      await this.educationsRepository
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
      educations:
        profile.educations.map(
          (education) => ({
            id:
              education.id,

            institution:
              education.institution,

            degree:
              education.degree,

            fieldOfStudy:
              education.fieldOfStudy,

            description:
              education.description,

            startedAt:
              this.formatDate(
                education.startedAt,
              ),

            endedAt:
              education.endedAt
                ? this.formatDate(
                    education.endedAt,
                  )
                : null,

            isCurrent:
              education.isCurrent,
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