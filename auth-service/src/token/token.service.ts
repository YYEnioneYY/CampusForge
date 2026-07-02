import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenPayload } from './types/access-token-payload.type';
import { RefreshTokenPayload } from './types/refresh-token-payload.type';
import { JwtExpiresIn } from './types/jwt-expires-in.type';

@Injectable()
export class TokenService {
    constructor(
      private readonly jwtService: JwtService,
      private readonly configService: ConfigService,
    ) {}

    private parseJwtExpiresIn(value: string): JwtExpiresIn {
      const normalizedValue = value.trim();

      const isValid = /^\d+(s|m|h|d)$/.test(normalizedValue);

      if (!isValid) {
        throw new Error(
          'Invalid JWT expiration format. Use values like 15m, 1h, 7d, 30d',
        );
      }

      return normalizedValue as JwtExpiresIn;
    }

    async generateAccessToken(payload: AccessTokenPayload): Promise<string> {
      const secret = this.configService.getOrThrow<string>('JWT_ACCESS_SECRET');
        
      const expiresIn = this.parseJwtExpiresIn(
        this.configService.getOrThrow<string>('JWT_ACCESS_EXPIRES_IN'),
      );
  
      return this.jwtService.signAsync(payload, {
        secret,
        expiresIn,
      });
    }

    async generateRefreshToken(payload: RefreshTokenPayload): Promise<string> {
      const secret = this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');

      const expiresIn = this.parseJwtExpiresIn(
        this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN'),
      );

      return this.jwtService.signAsync(payload, {
        secret,
        expiresIn,
      });
    }

    private expiresInToDate(value: string): Date {
      const normalizedValue = this.parseJwtExpiresIn(value);

      const match = normalizedValue.match(/^(\d+)(s|m|h|d)$/);

      if (!match) {
        throw new Error('Invalid JWT expiration format');
      }

      const amount = Number(match[1]);
      const unit = match[2];

      const multiplierMap: Record<string, number> = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
        y: 365 * 24 * 60 * 60 * 1000,
      };

      return new Date(Date.now() + amount * multiplierMap[unit]);
    }

    getRefreshTokenExpiresAt(): Date {
      const expiresIn = this.configService.getOrThrow<string>(
        'JWT_REFRESH_EXPIRES_IN',
      );
    
      return this.expiresInToDate(expiresIn);
    }

    async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
      const secret = this.configService.getOrThrow<string>('JWT_ACCESS_SECRET');

      return this.jwtService.verifyAsync<AccessTokenPayload>(token, {
        secret,
      });
    }

    async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
      const secret = this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');

      return this.jwtService.verifyAsync<RefreshTokenPayload>(token, {
        secret,
      });
    }
}