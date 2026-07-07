import { Injectable } from '@nestjs/common';
import { ProfileVisibility } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async createForUser(dto: CreateUserProfileDto) {
    return this.prisma.userProfile.upsert({
      where: {
        userId: dto.userId,
      },
      create: {
        userId: dto.userId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        middleName: dto.middleName ?? null,
        visibility: ProfileVisibility.PUBLIC,
      },
      update: {},
      select: {
        id: true,
        userId: true,
        firstName: true,
        lastName: true,
        middleName: true,
        avatarUrl: true,
        bio: true,
        city: true,
        country: true,
        dateOfBirth: true,
        visibility: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}