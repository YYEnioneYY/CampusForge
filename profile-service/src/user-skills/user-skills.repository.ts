import {
  Injectable,
} from '@nestjs/common';

import {
  PrismaService,
} from '../prisma/prisma.service';

export type UserSkillSnapshotData = {
  skillId: string;
  skillName: string;
  skillSlug: string;
};

const userSkillSelect = {
  id: true,
  skillId: true,
  skillName: true,
  skillSlug: true,
} as const;

@Injectable()
export class UserSkillsRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createManyForUser(
    userId: string,
    skills: UserSkillSnapshotData[],
    maxSkills: number,
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

        const requestedSkillIds =
          skills.map(
            (skill) => skill.skillId,
          );

        const existingSkills =
          await tx.userSkill.findMany({
            where: {
              userId,

              skillId: {
                in: requestedSkillIds,
              },
            },

            select: {
              skillId: true,
            },
          });

        if (existingSkills.length > 0) {
          return {
            status:
              'already_exists',

            existingSkillIds:
              existingSkills.map(
                (skill) =>
                  skill.skillId,
              ),
          } as const;
        }

        const currentSkillsCount =
          await tx.userSkill.count({
            where: {
              userId,
            },
          });

        if (
          currentSkillsCount +
            skills.length >
          maxSkills
        ) {
          return {
            status:
              'limit_reached',
          } as const;
        }

        await tx.userSkill.createMany({
          data: skills.map(
            (skill) => ({
              userId,

              skillId:
                skill.skillId,

              skillName:
                skill.skillName,

              skillSlug:
                skill.skillSlug,
            }),
          ),
        });

        const createdSkills =
          await tx.userSkill.findMany({
            where: {
              userId,

              skillId: {
                in: requestedSkillIds,
              },
            },

            select:
              userSkillSelect,

            orderBy: {
              skillName: 'asc',
            },
          });

        return {
          status:
            'created',

          skills:
            createdSkills,
        } as const;
      },
    );
  }

  async deleteForUser(
    userId: string,
    id: string,
  ): Promise<boolean> {
    const result =
      await this.prisma.userSkill.deleteMany({
        where: {
          id,
          userId,

          profile: {
            deletedAt: null,
          },
        },
      });

    return result.count === 1;
  }

  async findProfileWithSkillsByUsername(
    username: string,
  ) {
    return this.prisma.userProfile.findFirst({
      where: {
        username,
        deletedAt: null,
      },
    
      select: {
        visibility: true,
      
        skills: {
          select: userSkillSelect,
        
          orderBy: [
            {
              skillName: 'asc',
            },
            {
              createdAt: 'asc',
            },
          ],
        },
      },
    });
  }
}