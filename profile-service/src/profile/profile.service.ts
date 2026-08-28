import { Injectable } from '@nestjs/common';
import { throwRpcError } from 'src/common/rpc/throw-rpc-error';
import { RpcErrorCode } from 'src/common/rpc/rpc-error-code';

import { Prisma } from '../generated/prisma/client';

import { firstValueFrom } from 'rxjs';
import { REFERENCE_PATTERNS } from 'src/kafka/patterns/reference-patterns';

import { ProfileRepository, UpdateProfileData } from './profile.repository';
import { ReferenceKafkaService } from 'src/kafka/reference-kafka.service';

// Utils
import { generateUsername } from './utils/generate-username';
import { getProfileVisibilityOptions } from './utils/get-profile-visibility-options';

// Dto & Response
import { CreateUserProfileDto } from './dto/create-user-profile.dto';

import { GetMyProfileDto } from './dto/get-my-profile.dto';
import { ProfileResponse } from './types/profile-response.type';

import { UpdateMyProfileDto } from './dto/update-my-profile.dto';

import { ChangeUsernameDto } from './dto/change-username.dto';
import type { ChangeUsernameResponse } from './types/change-username-response.type';

import { ProfileRecord } from './profile.repository';

import { GetReferenceCountryPayload } from './types/reference-country.type';
import { GetReferenceCountryResponse } from './types/reference-country.type';

import type { ProfileVisibilityOptionsResponse } from './types/profile-visibility-options-response.type';

import { ChangeProfileVisibilityDto } from './dto/change-profile-visibility.dto';
import { ChangeProfileVisibilityResponse } from './types/change-profile-visibility-response.type';

import { MediaFileReadyDto } from './dto/media-file-ready.dto';

@Injectable()
export class ProfileService {
  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly referenceKafkaService: ReferenceKafkaService,
  ) {}

  async createForUser(
    dto: CreateUserProfileDto,
  ): Promise<void> {
    const username = generateUsername(dto.userId);

    await this.profileRepository.createForUser({
      userId: dto.userId,

      username,

      firstName: dto.firstName,
      lastName: dto.lastName,
    });
  }

  async getMyProfile(
    dto: GetMyProfileDto,
  ): Promise<ProfileResponse> {
    const profile = await this.profileRepository.findByUserId(dto.userId);
  
    if (!profile) {
      throwRpcError(
        RpcErrorCode.PROFILE_NOT_FOUND,
        'Profile not found',
      );
    }
  
    return this.mapProfile(profile);
  }

  async updateMyProfile(
    dto: UpdateMyProfileDto,
  ): Promise<ProfileResponse> {
    const existingProfile = await this.profileRepository.findByUserId(dto.userId);
  
    if (!existingProfile) {
      throwRpcError(
        RpcErrorCode.PROFILE_NOT_FOUND,
        'Profile not found',
      );
    }
  
    const updateData: UpdateProfileData = {
      firstName: dto.firstName,
      lastName: dto.lastName,
  
      middleName: dto.middleName,
  
      bio: dto.bio,
  
      dateOfBirth:
        dto.dateOfBirth === undefined
          ? undefined
          : dto.dateOfBirth === null
            ? null
            : this.parseDateOfBirth(
                dto.dateOfBirth,
              ),
    };
  
    if (dto.countryCode === null) {
      updateData.countryCode = null;
      updateData.countryName = null;
    } else if (
      dto.countryCode !== undefined
    ) {
      const response =
        await firstValueFrom(
          this.referenceKafkaService.send<
            GetReferenceCountryResponse,
            GetReferenceCountryPayload
          >(
            REFERENCE_PATTERNS.GET_COUNTRY,
            {
              code: dto.countryCode,
            },
          ),
        );
  
      updateData.countryCode =
        response.country.code2;
  
      updateData.countryName =
        response.country.name;
    }
  
    const updatedProfile =
      await this.profileRepository
        .updateByUserId(
          dto.userId,
          updateData,
        );
  
    return this.mapProfile(updatedProfile);
  }

  async changeUsername(
    dto: ChangeUsernameDto,
  ): Promise<ChangeUsernameResponse> {
    try {
      const result =
        await this.profileRepository
          .updateUsername(
            dto.userId,
            dto.username,
          );
  
      return {
        username:
          result.username,
      };
    } catch (error) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError
      ) {
        if (error.code === 'P2002') {
          throwRpcError(
            RpcErrorCode.USERNAME_ALREADY_TAKEN,
            'Username is already taken',
          );
        }
  
        if (error.code === 'P2025') {
          throwRpcError(
            RpcErrorCode.PROFILE_NOT_FOUND,
            'Profile not found',
          );
        }
      }
  
      throw error;
    }
  }

  getVisibilityOptions(): ProfileVisibilityOptionsResponse {
    return {
      options: getProfileVisibilityOptions()
    };
  }

  async changeVisibility(
    dto: ChangeProfileVisibilityDto,
  ): Promise<ChangeProfileVisibilityResponse> {
    try {
      const result = await this.profileRepository.updateVisibility(
        dto.userId,
        dto.visibility,
      );

      return {
        visibility: result.visibility,
      };
    } catch (error) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throwRpcError(
          RpcErrorCode.PROFILE_NOT_FOUND,
          'Profile not found',
        );
      }

      throw error;
    }
  }

  async handleMediaFileReady(
    dto: MediaFileReadyDto,
  ): Promise<void> {
    if (
      dto.ownerType !== 'user' ||
      dto.purpose !== 'profile_avatar'
    ) {
      return;
    }
  
    const existingProfile =
      await this.profileRepository
        .findByUserId(
          dto.ownerId,
        );
  
    if (!existingProfile) {
      throw new Error(
        `Profile not found for media owner: ${dto.ownerId}`,
      );
    }
  
    await this.profileRepository
      .updateByUserId(
        dto.ownerId,
        {
          avatarId: dto.mediaId,
        },
      );
  }

  private parseDateOfBirth(
    value: string,
  ): Date {
    const [year, month, day] =
      value
        .split('-')
        .map(Number);

    const date = new Date(
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
        'Invalid date of birth',
      );
    }

    return date;
  }

  private mapProfile(
    profile: ProfileRecord,
  ): ProfileResponse {
    return {
      profile: {
        username: profile.username,

        firstName: profile.firstName,
        lastName: profile.lastName,
        middleName: profile.middleName,
  
        avatarId: profile.avatarId,
        bio: profile.bio,
  
        countryCode: profile.countryCode,
        countryName: profile.countryName,
  
        dateOfBirth:
          profile.dateOfBirth
            ? profile.dateOfBirth
                .toISOString()
                .slice(0, 10)
            : null,
  
        visibility: profile.visibility,
      },
    };
  }
}