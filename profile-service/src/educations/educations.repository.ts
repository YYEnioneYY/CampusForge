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
}