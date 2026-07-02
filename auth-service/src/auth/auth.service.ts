import { ConflictException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import { PasswordService } from '../password/password.service';
import { TokenService } from '../token/token.service';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();

    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await this.passwordService.hashPassword(dto.password);

    const user = await this.usersService.createUser({
      email,
      phone: dto.phone,
      passwordHash,
    });

    const sessionId = randomUUID();

    const accessToken = await this.tokenService.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.systemRole,
    });

    const refreshToken = await this.tokenService.generateRefreshToken({
      sub: user.id,
      jti: sessionId,
    });

    await this.refreshTokenService.createSession({
      id: sessionId,
      userId: user.id,
      refreshToken,
      expiresAt: this.tokenService.getRefreshTokenExpiresAt(),
      deviceName: dto.deviceName,
      ipAddress: dto.ipAddress,
      userAgent: dto.userAgent,
    });

    return {
      user,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }
}