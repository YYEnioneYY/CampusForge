import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '../generated/prisma/client';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { RefreshTokenRepository } from './refresh-token.repository';
import { CreateRefreshTokenSessionInput } from './types/create-refresh-token-session.input';
import { FindActiveRefreshTokenSessionInput } from './types/find-active-refresh-token-session.input';
import { RotateRefreshTokenSessionInput } from './types/rotate-refresh-token-session.input';
import { GetUserSessionsInput } from './types/get-user-sessions.input';

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly configService: ConfigService,
  ) {}

  async createSession(input: CreateRefreshTokenSessionInput) {
    const tokenHash = this.hashToken(input.refreshToken);

    return this.refreshTokenRepository.createSession({
      id: input.id,
      userId: input.userId,
      tokenHash,
      deviceName: input.deviceName,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      expiresAt: input.expiresAt,
    });
  }

  async findActiveSession(
    input: FindActiveRefreshTokenSessionInput,
  ) {
    const expectedTokenHash = this.hashToken(input.refreshToken);

    const session =
      await this.refreshTokenRepository.findByIdWithUser(input.id);

    if (!session) {
      return null;
    }

    if (session.userId !== input.userId) {
      return null;
    }

    if (
      !this.areHashesEqual(
        session.tokenHash,
        expectedTokenHash,
      )
    ) {
      return null;
    }

    if (!this.isActive(session, new Date())) {
      return null;
    }

    return session;
  }

  async revokeById(id: string): Promise<void> {
    await this.refreshTokenRepository.revokeById(
      id,
      new Date(),
    );
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.revokeAllByUserId(
      userId,
      new Date(),
    );
  }

  async revokeAllUserTokensExcept(
    userId: string,
    exceptSessionId: string,
  ): Promise<void> {
    await this.refreshTokenRepository.revokeAllExcept(
      userId,
      exceptSessionId,
      new Date(),
    );
  }

  async rotateSession(input: RotateRefreshTokenSessionInput) {
    const tokenHash = this.hashToken(
      input.newSession.refreshToken,
    );

    return this.refreshTokenRepository.rotateSession({
      oldSessionId: input.oldSessionId,
      rotatedAt: new Date(),
      newSession: {
        id: input.newSession.id,
        userId: input.newSession.userId,
        tokenHash,
        deviceName: input.newSession.deviceName,
        ipAddress: input.newSession.ipAddress,
        userAgent: input.newSession.userAgent,
        expiresAt: input.newSession.expiresAt,
      },
    });
  }

  async revokeUserSession(
    userId: string,
    sessionId: string,
  ): Promise<boolean> {
    return this.refreshTokenRepository.revokeUserSession(
      userId,
      sessionId,
      new Date(),
    );
  }

  async getUserSessions(input: GetUserSessionsInput) {
    const sessions =
      await this.refreshTokenRepository.findActiveUserSessions(
        input.userId,
        new Date(),
      );

    return sessions.map((session) => ({
      ...session,
      isCurrent: input.currentSessionId
        ? session.id === input.currentSessionId
        : false,
    }));
  }

  async revokeAllUserTokensInTransaction(
    userId: string,
    revokedAt: Date,
    tx: Prisma.TransactionClient,
  ): Promise<number> {
    return this.refreshTokenRepository.revokeAllInTransaction(
      userId,
      revokedAt,
      tx,
    );
  }

  async revokeAllUserTokensExceptInTransaction(
    userId: string,
    exceptSessionId: string,
    revokedAt: Date,
    tx: Prisma.TransactionClient,
  ): Promise<number> {
    return this.refreshTokenRepository.revokeAllExceptInTransaction(
      userId,
      exceptSessionId,
      revokedAt,
      tx,
    );
  }

  private hashToken(token: string): string {
    const secret = this.configService.getOrThrow<string>(
      'REFRESH_TOKEN_HASH_SECRET',
    );

    return createHmac('sha256', secret)
      .update(token)
      .digest('hex');
  }

  private isActive(
    session: {
      expiresAt: Date;
      revokedAt: Date | null;
    },
    now: Date,
  ): boolean {
    return (
      session.revokedAt === null &&
      session.expiresAt > now
    );
  }

  private areHashesEqual(
    firstHash: string,
    secondHash: string,
  ): boolean {
    const firstBuffer = Buffer.from(firstHash, 'hex');
    const secondBuffer = Buffer.from(secondHash, 'hex');

    if (firstBuffer.length !== secondBuffer.length) {
      return false;
    }

    return timingSafeEqual(firstBuffer, secondBuffer);
  }
}