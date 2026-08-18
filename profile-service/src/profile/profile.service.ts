import { Injectable } from '@nestjs/common';
import { throwRpcError } from 'src/common/rpc/throw-rpc-error';
import { RpcErrorCode } from 'src/common/rpc/rpc-error-code';

import { ProfileRepository } from './profile.repository';

import { CreateUserProfileDto } from './dto/create-user-profile.dto';

import { GetMyProfileDto } from './dto/get-my-profile.dto';
import { ProfileResponse } from './types/profile-response.type';

import { UpdateMyProfileDto } from './dto/update-my-profile.dto';

import { ProfileRecord } from './profile.repository';

@Injectable()
export class ProfileService {
  constructor(
    private readonly profileRepository: ProfileRepository,
  ) {}

  async createForUser(
    dto: CreateUserProfileDto,
  ) {
    return this.profileRepository.createForUser(dto);
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
  
    return {
      profile: {
        id: profile.id,
        userId: profile.userId,
  
        firstName: profile.firstName,
        lastName: profile.lastName,
        middleName: profile.middleName,
  
        avatarUrl: profile.avatarUrl,
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
  
        createdAt:
          profile.createdAt.toISOString(),
  
        updatedAt:
          profile.updatedAt.toISOString(),
      },
    };
  }

  async updateMyProfile(
    dto: UpdateMyProfileDto,
  ): Promise<ProfileResponse> {
    const existingProfile =
      await this.profileRepository
        .findByUserId(dto.userId);
  
    if (!existingProfile) {
      throwRpcError(
        RpcErrorCode.PROFILE_NOT_FOUND,
        'Profile not found',
      );
    }
  
    const updatedProfile =
      await this.profileRepository
        .updateByUserId(
          dto.userId,
          {
            firstName: dto.firstName,
            lastName: dto.lastName,
  
            middleName: dto.middleName,
  
            avatarUrl: dto.avatarUrl,
            bio: dto.bio,
  
            dateOfBirth:
              dto.dateOfBirth === undefined
                ? undefined
                : dto.dateOfBirth === null
                  ? null
                  : new Date(
                      `${dto.dateOfBirth}T00:00:00.000Z`,
                    ),
  
            visibility: dto.visibility,
          },
        );
  
    return this.mapProfile(
      updatedProfile,
    );
  }

  private mapProfile(
    profile: ProfileRecord,
  ): ProfileResponse {
    return {
      profile: {
        id: profile.id,
        userId: profile.userId,
  
        firstName: profile.firstName,
        lastName: profile.lastName,
        middleName: profile.middleName,
  
        avatarUrl: profile.avatarUrl,
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
  
        createdAt:
          profile.createdAt.toISOString(),
  
        updatedAt:
          profile.updatedAt.toISOString(),
      },
    };
  }
}