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

import {
  CreateWorkExperienceDto,
} from './dto/create-work-experience.dto';

import type {
  CreateWorkExperienceResponse,
} from './types/create-work-experience-response.type';

import type {
  CreateWorkExperienceData,
} from './work-experiences.repository';

import {
  UpdateWorkExperienceDto,
} from './dto/update-work-experience.dto';

import type {
  UpdateWorkExperienceResponse,
} from './types/update-work-experience-response.type';

import type {
  UpdateWorkExperienceData,
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

  async createWorkExperience(
    dto: CreateWorkExperienceDto,
  ): Promise<CreateWorkExperienceResponse> {
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
          'endedAt must be null for current work experience',
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
          'endedAt is required for completed work experience',
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
      CreateWorkExperienceData = {
        company:
          dto.company,

        position:
          dto.position,

        description:
          dto.description ?? null,

        startedAt,
        endedAt,

        isCurrent:
          dto.isCurrent,
      };

    const result =
      await this.workExperiencesRepository
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
      workExperience: {
        id:
          result.workExperience.id,

        company:
          result.workExperience.company,

        position:
          result.workExperience.position,

        description:
          result.workExperience.description,

        startedAt:
          this.formatDate(
            result.workExperience.startedAt,
          ),

        endedAt:
          result.workExperience.endedAt
            ? this.formatDate(
                result.workExperience.endedAt,
              )
            : null,

        isCurrent:
          result.workExperience.isCurrent,
      },
    };
  }

  async updateWorkExperience(
    dto: UpdateWorkExperienceDto,
  ): Promise<UpdateWorkExperienceResponse> {
    const hasUpdates = [
      dto.company,
      dto.position,
      dto.description,
      dto.startedAt,
      dto.endedAt,
      dto.isCurrent,
    ].some(
      (value) =>
        value !== undefined,
    );

    if (!hasUpdates) {
      throwRpcError(
        RpcErrorCode.VALIDATION_ERROR,
        'At least one field must be provided',
      );
    }

    const profile =
      await this.workExperiencesRepository
        .findOneForUser(
          dto.userId,
          dto.id,
        );

    if (!profile) {
      throwRpcError(
        RpcErrorCode.PROFILE_NOT_FOUND,
        'Profile not found',
      );
    }

    const existing =
      profile.workExperiences[0];

    if (!existing) {
      throwRpcError(
        RpcErrorCode.WORK_EXPERIENCE_NOT_FOUND,
        'Work experience not found',
      );
    }

    const startedAt =
      dto.startedAt === undefined
        ? existing.startedAt
        : this.parseDate(
            dto.startedAt,
            'startedAt',
          );

    const isCurrent =
      dto.isCurrent ??
      existing.isCurrent;

    let endedAt =
      dto.endedAt === undefined
        ? existing.endedAt
        : dto.endedAt === null
          ? null
          : this.parseDate(
              dto.endedAt,
              'endedAt',
            );

    if (
      dto.isCurrent === true &&
      dto.endedAt === undefined
    ) {
      endedAt = null;
    }

    const today =
      this.getToday();

    if (startedAt > today) {
      throwRpcError(
        RpcErrorCode.VALIDATION_ERROR,
        'startedAt cannot be in the future',
      );
    }

    if (isCurrent) {
      if (endedAt !== null) {
        throwRpcError(
          RpcErrorCode.VALIDATION_ERROR,
          'endedAt must be null for current work experience',
        );
      }
    } else {
      if (endedAt === null) {
        throwRpcError(
          RpcErrorCode.VALIDATION_ERROR,
          'endedAt is required for completed work experience',
        );
      }

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
      UpdateWorkExperienceData = {
        company:
          dto.company === undefined
            ? existing.company
            : dto.company,

        position:
          dto.position === undefined
            ? existing.position
            : dto.position,

        description:
          dto.description === undefined
            ? existing.description
            : dto.description,

        startedAt,
        endedAt,
        isCurrent,
      };

    const updated =
      await this.workExperiencesRepository
        .updateForUser(
          dto.userId,
          dto.id,
          data,
        );

    if (!updated) {
      throwRpcError(
        RpcErrorCode.WORK_EXPERIENCE_NOT_FOUND,
        'Work experience not found',
      );
    }

    return {
      workExperience: {
        id:
          updated.id,

        company:
          updated.company,

        position:
          updated.position,

        description:
          updated.description,

        startedAt:
          this.formatDate(
            updated.startedAt,
          ),

        endedAt:
          updated.endedAt
            ? this.formatDate(
                updated.endedAt,
              )
            : null,

        isCurrent:
          updated.isCurrent,
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