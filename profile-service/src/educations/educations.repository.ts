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

export type CreateEducationData = {
  institution: string;
  degree: string | null;
  fieldOfStudy: string | null;
  description: string | null;

  startedAt: Date;
  endedAt: Date | null;
  isCurrent: boolean;
};

export type UpdateEducationData = {
  institution: string;
  degree: string | null;
  fieldOfStudy: string | null;
  description: string | null;

  startedAt: Date;
  endedAt: Date | null;
  isCurrent: boolean;
};

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

  async createForUser(
    userId: string,
    data: CreateEducationData,
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

        const education =
          await tx.education.create({
            data: {
              userId,

              institution:
                data.institution,

              degree:
                data.degree,

              fieldOfStudy:
                data.fieldOfStudy,

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
              educationSelect,
          });

        return {
          status:
            'created',

          education,
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
        educations: {
          where: {
            id,
          },

          select:
            educationSelect,

          take: 1,
        },
      },
    });
  }

  async updateForUser(
    userId: string,
    id: string,
    data: UpdateEducationData,
  ) {
    const updated =
      await this.prisma.education
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
            institution:
              data.institution,

            degree:
              data.degree,

            fieldOfStudy:
              data.fieldOfStudy,

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
            educationSelect,
        });

    return updated[0] ?? null;
  }

  async deleteForUser(
    userId: string,
    id: string,
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
      
        const result =
          await tx.education.deleteMany({
            where: {
              id,
              userId,
            },
          });
        
        if (result.count === 0) {
          return {
            status:
              'education_not_found',
          } as const;
        }
      
        return {
          status:
            'deleted',
        } as const;
      },
    );
  }
}