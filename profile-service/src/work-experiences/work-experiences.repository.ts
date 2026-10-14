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

export type CreateWorkExperienceData = {
  company: string;
  position: string;
  description: string | null;

  startedAt: Date;
  endedAt: Date | null;
  isCurrent: boolean;
};

export type UpdateWorkExperienceData = {
  company: string;
  position: string;
  description: string | null;

  startedAt: Date;
  endedAt: Date | null;
  isCurrent: boolean;
};

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

  async createForUser(
    userId: string,
    data: CreateWorkExperienceData,
  ) {
    return this.prisma.$transaction(
      async (tx) => {
        const profile =
          await tx.userProfile.findFirst({
            where: {
              userId,
              deletedAt: null,
            },

            select: {
              userId: true,
            },
          });

        if (!profile) {
          return {
            status:
              'profile_not_found',
          } as const;
        }

        const workExperience =
          await tx.workExperience.create({
            data: {
              userId,

              company:
                data.company,

              position:
                data.position,

              description:
                data.description,

              startedAt:
                data.startedAt,

              endedAt:
                data.endedAt,

              isCurrent:
                data.isCurrent,
            },

            select:
              workExperienceSelect,
          });

        return {
          status:
            'created',

          workExperience,
        } as const;
      },
    );
  }

  async findOneForUser(
    userId: string,
    id: string,
  ) {
    return this.prisma.userProfile.findFirst({
      where: {
        userId,
        deletedAt: null,
      },

      select: {
        workExperiences: {
          where: {
            id,
          },

          select:
            workExperienceSelect,

          take: 1,
        },
      },
    });
  }

  async updateForUser(
    userId: string,
    id: string,
    data: UpdateWorkExperienceData,
  ) {
    const updated =
      await this.prisma.workExperience
        .updateManyAndReturn({
          where: {
            id,
            userId,
          
            profile: {
              is: {
                deletedAt: null,
              },
            },
          },
        
          data: {
            company:
              data.company,
          
            position:
              data.position,
          
            description:
              data.description,
          
            startedAt:
              data.startedAt,
          
            endedAt:
              data.endedAt,
          
            isCurrent:
              data.isCurrent,
          },
        
          select:
            workExperienceSelect,
        });
      
    return updated[0] ?? null;
  }
}