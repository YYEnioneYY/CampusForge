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

import {
  CreateEducationDto,
} from './dto/create-education.dto';

import type {
  CreateEducationResponse,
} from './types/create-education-response.type';

import type {
  CreateEducationData,
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

  async createEducation(
    dto: CreateEducationDto,
  ): Promise<CreateEducationResponse> {
    const startedAt =
      this.parseDate(
        dto.startedAt,
        'startedAt',
      );

    const today =
      this.getToday();

    if (startedAt > today) {
      throwRpcError(
        RpcErrorCode.VALIDATION_ERROR,
        'startedAt cannot be in the future',
      );
    }

    let endedAt: Date | null;

    if (dto.isCurrent) {
      if (
        dto.endedAt !== undefined &&
        dto.endedAt !== null
      ) {
        throwRpcError(
          RpcErrorCode.VALIDATION_ERROR,
          'endedAt must be null for current education',
        );
      }

      endedAt = null;
    } else {
      if (
        dto.endedAt === undefined ||
        dto.endedAt === null
      ) {
        throwRpcError(
          RpcErrorCode.VALIDATION_ERROR,
          'endedAt is required for completed education',
        );
      }

      endedAt =
        this.parseDate(
          dto.endedAt,
          'endedAt',
        );

      if (endedAt < startedAt) {
        throwRpcError(
          RpcErrorCode.VALIDATION_ERROR,
          'endedAt cannot be earlier than startedAt',
        );
      }

      if (endedAt > today) {
        throwRpcError(
          RpcErrorCode.VALIDATION_ERROR,
          'endedAt cannot be in the future',
        );
      }
    }

    const data:
      CreateEducationData = {
        institution:
          dto.institution,

        degree:
          dto.degree ?? null,

        fieldOfStudy:
          dto.fieldOfStudy ?? null,

        description:
          dto.description ?? null,

        startedAt,
        endedAt,

        isCurrent:
          dto.isCurrent,
      };

    const result =
      await this.educationsRepository
        .createForUser(
          dto.userId,
          data,
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

    return {
      education: {
        id:
          result.education.id,

        institution:
          result.education.institution,

        degree:
          result.education.degree,

        fieldOfStudy:
          result.education.fieldOfStudy,

        description:
          result.education.description,

        startedAt:
          this.formatDate(
            result.education.startedAt,
          ),

        endedAt:
          result.education.endedAt
            ? this.formatDate(
                result.education.endedAt,
              )
            : null,

        isCurrent:
          result.education.isCurrent,
      },
    };
  }

  private formatDate(
    value: Date,
  ): string {
    return value
      .toISOString()
      .slice(0, 10);
  }

  private parseDate(
    value: string,
    fieldName: string,
  ): Date {
    const [
      year,
      month,
      day,
    ] = value
      .split('-')
      .map(Number);
  
    const date =
      new Date(
        Date.UTC(
          year,
          month - 1,
          day,
        ),
      );
    
    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      throwRpcError(
        RpcErrorCode.VALIDATION_ERROR,
        `${fieldName} must be a valid date`,
      );
    }
  
    return date;
  }
  
  private getToday(): Date {
    const now =
      new Date();
  
    return new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
      ),
    );
  }
}