import {
  Injectable,
} from '@nestjs/common';

import {
  PrismaService,
} from '../prisma/prisma.service';

const workExperienceSelect = {
  id: true,

  company: true,
  position: true,
  description: true,

  startedAt: true,
  endedAt: true,
  isCurrent: true,
} as const;

@Injectable()
export class WorkExperiencesRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findByUserId(
    userId: string,
  ) {
    return this.prisma.userProfile.findFirst({
      where: {
        userId,
        deletedAt: null,
      },

      select: {
        workExperiences: {
          select:
            workExperienceSelect,

          orderBy: [
            {
              isCurrent:
                'desc',
            },
            {
              startedAt:
                'desc',
            },
            {
              createdAt:
                'desc',
            },
          ],
        },
      },
    });
  }
}