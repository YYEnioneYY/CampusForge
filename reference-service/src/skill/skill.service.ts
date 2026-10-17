import {
  Injectable,
} from '@nestjs/common';

import {
  PrismaService,
} from '../prisma/prisma.service';

import {
  SearchSkillsDto,
} from './dto/search-skills.dto';

import type {
  SearchSkillsResponse,
} from './types/search-skills-response.type';

@Injectable()
export class SkillService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async searchSkills(
    dto: SearchSkillsDto,
  ): Promise<SearchSkillsResponse> {
    const skills =
      await this.prisma.skill.findMany({
        where: {
          isActive: true,

          normalizedName: {
            contains: dto.query,
          },
        },

        select: {
          id: true,
          name: true,
          slug: true,
        },

        orderBy: {
          name: 'asc',
        },

        take: dto.limit,
      });

    return {
      items: skills,
    };
  }
}