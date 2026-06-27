import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RpcException } from '@nestjs/microservices';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, UserStatus } from '../generated/prisma/client';
import { RegisterDto } from './dto/register.dto';
import { RefreshDto } from './dto/refresh.dto';
import { getArgon2Options } from './config/argon2.config';
import { TokensService } from './tokens/tokens.service';
import { UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { GetSessionsDto, LogoutSessionDto } from './dto/sessions.dto';

import { VerifyEmailDto } from './dto/verify-email.dto';
import {
  generateEmailVerificationToken,
  hashEmailVerificationToken,
} from './utils/email-verification-token.util';
import { parseDurationToSeconds, secondsFromNow } from './utils/duration.util';
import { NotificationsService } from '../notifications/notifications.service';
import { ResendEmailVerificationDto } from './dto/resend-email-verification.dto';


@Injectable()
export class AuthService {
  private readonly argon2Options: argon2.Options;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly tokensService: TokensService,
    private readonly notificationsService: NotificationsService,
  ) {
    this.argon2Options = getArgon2Options(this.configService);
  }

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const phone = dto.phone?.trim() || null;

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, ...(phone ? [{ phone }] : [])],
      },
      select: {
        id: true,
        email: true,
        phone: true,
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new RpcException({
          statusCode: 409,
          message: 'Пользователь с таким email уже существует',
          error: 'Conflict',
        });
      }

      if (phone && existingUser.phone === phone) {
        throw new RpcException({
          statusCode: 409,
          message: 'Пользователь с таким телефоном уже существует',
          error: 'Conflict',
        });
      }
    }

    const passwordHash = await argon2.hash(dto.password, this.argon2Options);

    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          phone,
          passwordHash,
          status: UserStatus.PENDING,
        },
        select: {
          id: true,
          email: true,
          phone: true,
          systemRole: true,
          status: true,
          emailVerifiedAt: true,
          createdAt: true,
        },
      });

      await this.createAndSendEmailVerification(user.id, user.email);

      const tokens = await this.tokensService.generateAuthTokens(
        {
          id: user.id,
          email: user.email,
          systemRole: user.systemRole,
          status: user.status,
        },
        dto.metadata,
      );

      return {
        user,
        tokens,
        message: 'Пользователь успешно зарегистрирован',
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new RpcException({
          statusCode: 409,
          message: 'Пользователь с такими данными уже существует',
          error: 'Conflict',
        });
      }

      throw error;
    }
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        passwordHash: true,
        systemRole: true,
        status: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        deletedAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new RpcException({
        statusCode: 401,
        message: 'Неверный email или пароль',
        error: 'Unauthorized',
      });
    }

    if (user.status === UserStatus.BLOCKED || user.status === UserStatus.DELETED || user.deletedAt) {
      throw new RpcException({
        statusCode: 403,
        message: 'Пользователь заблокирован или удалён',
        error: 'Forbidden',
      });
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, dto.password);

    if (!isPasswordValid) {
      throw new RpcException({
        statusCode: 401,
        message: 'Неверный email или пароль',
        error: 'Unauthorized',
      });
    }

    const updatedUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastLoginAt: new Date(),
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
      },
    });

    const tokens = await this.tokensService.generateAuthTokens(
      {
        id: updatedUser.id,
        email: updatedUser.email,
        systemRole: updatedUser.systemRole,
        status: updatedUser.status,
      },
      dto.metadata,
    );

    return {
      user: updatedUser,
      tokens,
      message: 'Пользователь успешно вошёл в систему',
    };
  }

  async refresh(dto: RefreshDto) {
    const tokens = await this.tokensService.refreshTokens(dto.refreshToken);

    return {
      tokens,
      message: 'Токены успешно обновлены',
    };
  }

  async logout(dto: LogoutDto) {
    await this.tokensService.revokeRefreshToken(dto.refreshToken);

    return {
      message: 'Выход выполнен успешно',
    };
  }

  async logoutAll(dto: LogoutDto) {
    const result = await this.tokensService.revokeAllRefreshTokens(
      dto.refreshToken,
    );

    return {
      revokedCount: result.revokedCount,
      message: 'Выход выполнен со всех устройств',
    };
  }

  async getSessions(dto: GetSessionsDto) {
    const sessions = await this.tokensService.getUserSessions(dto.refreshToken);

    return {
      sessions,
    };
  }

  async logoutSession(dto: LogoutSessionDto) {
    const result = await this.tokensService.revokeUserSession(
      dto.refreshToken,
      dto.sessionId,
    );

    return {
      sessionId: result.sessionId,
      isCurrent: result.isCurrent,
      message: result.isCurrent
        ? 'Текущая сессия завершена'
        : 'Сессия успешно завершена',
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const emailVerificationSecret = this.getRequiredConfig(
      'EMAIL_VERIFICATION_SECRET',
    );

    const tokenHash = hashEmailVerificationToken(
      dto.token,
      emailVerificationSecret,
    );

    const verificationToken =
      await this.prisma.emailVerificationToken.findFirst({
        where: {
          tokenHash,
          usedAt: null,
        },
        include: {
          user: true,
        },
      });

    if (!verificationToken) {
      throw new RpcException({
        statusCode: 400,
        message: 'Некорректная или уже использованная ссылка подтверждения',
        error: 'Bad Request',
      });
    }

    if (verificationToken.expiresAt.getTime() <= Date.now()) {
      throw new RpcException({
        statusCode: 400,
        message: 'Ссылка подтверждения истекла',
        error: 'Bad Request',
      });
    }

    if (verificationToken.user.deletedAt) {
      throw new RpcException({
        statusCode: 403,
        message: 'Пользователь удалён',
        error: 'Forbidden',
      });
    }

    const user = await this.prisma.$transaction(async (tx) => {
      await tx.emailVerificationToken.update({
        where: {
          id: verificationToken.id,
        },
        data: {
          usedAt: new Date(),
        },
      });

      return tx.user.update({
        where: {
          id: verificationToken.userId,
        },
        data: {
          emailVerifiedAt: new Date(),
          status: UserStatus.ACTIVE,
        },
        select: {
          id: true,
          email: true,
          phone: true,
          systemRole: true,
          status: true,
          emailVerifiedAt: true,
          createdAt: true,
        },
      });
    });

    return {
      user,
      message: 'Email успешно подтверждён',
    };
  }

  async resendEmailVerification(dto: ResendEmailVerificationDto) {
    const payload = await this.tokensService.verifyAccessToken(dto.accessToken);
    
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
      select: {
        id: true,
        email: true,
        status: true,
        emailVerifiedAt: true,
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
  
    if (user.emailVerifiedAt || user.status === UserStatus.ACTIVE) {
      return {
        message: 'Email уже подтверждён',
      };
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
  
    const lastToken = await this.prisma.emailVerificationToken.findFirst({
      where: {
        userId: user.id,
        usedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        createdAt: true,
      },
    });
  
    if (lastToken && Date.now() - lastToken.createdAt.getTime() < 60_000) {
      throw new RpcException({
        statusCode: 429,
        message: 'Повторно отправить письмо можно через 1 минуту',
        error: 'Too Many Requests',
      });
    }
  
    await this.createAndSendEmailVerification(user.id, user.email);
  
    return {
      message: 'Письмо для подтверждения email отправлено повторно',
    };
  }

  private async createAndSendEmailVerification(
    userId: string,
    email: string,
  ): Promise<void> {
    const emailVerificationToken = generateEmailVerificationToken();

    const emailVerificationSecret = this.getRequiredConfig(
      'EMAIL_VERIFICATION_SECRET',
    );

    const emailVerificationExpiresIn = parseDurationToSeconds(
      this.configService.get<string>('EMAIL_VERIFICATION_EXPIRES_IN') || '1d',
      24 * 60 * 60,
    );

    await this.prisma.$transaction(async (tx) => {
      await tx.emailVerificationToken.updateMany({
        where: {
          userId,
          usedAt: null,
        },
        data: {
          usedAt: new Date(),
        },
      });

      await tx.emailVerificationToken.create({
        data: {
          userId,
          tokenHash: hashEmailVerificationToken(
            emailVerificationToken,
            emailVerificationSecret,
          ),
          expiresAt: secondsFromNow(emailVerificationExpiresIn),
        },
      });
    });

    const verificationUrl = this.getRequiredConfig('EMAIL_VERIFICATION_URL');

    const verificationLink = `${verificationUrl}?token=${emailVerificationToken}`;

    await this.notificationsService.sendEmailVerificationRequested({
      userId,
      email,
      verificationLink,
    });
  }

  private getRequiredConfig(name: string): string {
    const value = this.configService.get<string>(name);

    if (!value) {
      throw new Error(`Missing required config: ${name}`);
    }

    return value;
  }
}