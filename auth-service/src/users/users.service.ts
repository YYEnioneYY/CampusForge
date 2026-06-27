import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { UserStatus } from '../generated/prisma/client';

interface JwtAccessPayload {
  sub: string;
  email: string;
  role: string;
  status: string;
  tokenType: 'access';
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async me(accessToken: string) {
    const payload = await this.verifyAccessToken(accessToken);

    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        systemRole: true,
        status: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });

    if (!user) {
      throw new RpcException({
        statusCode: 404,
        message: 'Пользователь не найден',
        error: 'Not Found',
      });
    }

    if (
      user.status === UserStatus.BLOCKED ||
      user.status === UserStatus.DELETED ||
      user.deletedAt
    ) {
      throw new RpcException({
        statusCode: 403,
        message: 'Пользователь заблокирован или удалён',
        error: 'Forbidden',
      });
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        systemRole: user.systemRole,
        status: user.status,
        emailVerifiedAt: user.emailVerifiedAt,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  private async verifyAccessToken(accessToken: string): Promise<JwtAccessPayload> {
    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');

    if (!accessSecret) {
      throw new Error('Missing required config: JWT_ACCESS_SECRET');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtAccessPayload>(
        accessToken,
        {
          secret: accessSecret,
        },
      );

      if (payload.tokenType !== 'access') {
        throw new Error();
      }

      return payload;
    } catch {
      throw new RpcException({
        statusCode: 401,
        message: 'Некорректный или истёкший access token',
        error: 'Unauthorized',
      });
    }
  }
}