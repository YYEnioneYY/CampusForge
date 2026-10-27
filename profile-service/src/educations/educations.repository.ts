import {
  Injectable,
} from '@nestjs/common';

import {
  PrismaService,
} from '../prisma/prisma.service';

const educationSelect = {
  id: true,

  institution: true,
  degree: true,
  fieldOfStudy: true,
  description: true,

  startedAt: true,
  endedAt: true,
  isCurrent: true,
} as const;

@Injectable()
export class EducationsRepository {
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
        educations: {
          select:
            educationSelect,

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