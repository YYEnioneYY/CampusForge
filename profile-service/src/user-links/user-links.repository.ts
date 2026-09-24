import {
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
          select: {
            id: true,

            type: true,

            url: true,
            title: true,

            sortOrder: true,
          },

          orderBy: [
            { sortOrder: 'asc' },
            { createdAt: 'asc' },
          ],
        },
      },
    });
  }
}