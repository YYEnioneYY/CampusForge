import {
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import {
  UserLinkType,
} from '../generated/prisma/client';

export type CreateUserLinkData = {
  type: UserLinkType;

  url: string;
  title: string;
};

export type UpdateUserLinkData = {
  id: string;

  type?: UserLinkType;

  url?: string;
  title?: string;
}

const userLinkSelect = {
  id: true,

  type: true,

  url: true,
  title: true,

  sortOrder: true,
} as const;

@Injectable()
export class UserLinksRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findByUserId(
    userId: string,
  ) {
    return this.prisma.userProfile.findUnique({
      where: { userId },

      select: {
        links: {
          select: userLinkSelect,

          orderBy: [
            { sortOrder: 'asc' },
            { createdAt: 'asc' },
          ],
        },
      },
    });
  }

  async createForUser(
    userId: string,
    data: CreateUserLinkData,
    maxLinks: number,
  ) {
    return this.prisma.$transaction(
      async (tx) => {
        const profile =
          await tx.userProfile.findUnique({
            where: {
              userId,
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

        const linksState =
          await tx.userLink.aggregate({
            where: {
              userId,
            },

            _count: {
              _all: true,
            },

            _max: {
              sortOrder: true,
            },
          });

        if (
          linksState._count._all >=
          maxLinks
        ) {
          return {
            status:
              'limit_reached',
          } as const;
        }

        const sortOrder =
          (
            linksState._max.sortOrder ??
            -1
          ) + 1;

        const link =
          await tx.userLink.create({
            data: {
              userId,

              type:
                data.type,

              url:
                data.url,

              title:
                data.title,

              sortOrder,
            },

            select:
              userLinkSelect,
          });

        return {
          status:
            'created',

          link,
        } as const;
      },
    );
  }

  async findByIdForUser(
    userId: string,
    id: string,
  ) {
    return this.prisma.userLink.findFirst({
      where: {
        id,
        userId,
      },

      select:
        userLinkSelect,
    });
  }

  async updateForUser(
    userId: string,
    data: UpdateUserLinkData,
  ) {
    const updatedLinks =
      await this.prisma.userLink
        .updateManyAndReturn({
          where: {
            id: data.id,
            userId,
          },

          data: {
            type: data.type,

            url: data.url,
            title: data.title,
          },

          select: userLinkSelect,
        });

    return updatedLinks[0] ?? null;
  }
}