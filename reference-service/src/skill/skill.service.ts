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

import {
  GetSkillsByIdsDto,
} from './dto/get-skills-by-ids.dto';

import type {
  GetSkillsByIdsResponse,
} from './types/get-skills-by-ids-response.type';

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

          OR: [
            {
              normalizedName: {
                contains: dto.query,
              },
            },
          
            {
              aliases: {
                some: {
                  normalizedAlias: {
                    startsWith: dto.query,
                  },
                },
              },
            },
          ],
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

  async getSkillsByIds(
    dto: GetSkillsByIdsDto,
  ): Promise<GetSkillsByIdsResponse> {
    const skills =
      await this.prisma.skill.findMany({
        where: {
          id: {
            in: dto.skillIds,
          },
        
          isActive: true,
        },
      
        select: {
          id: true,
          name: true,
          slug: true,
        },
      });
    
    return {
      items: skills,
    };
  }
}