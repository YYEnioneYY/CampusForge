import { Injectable, UnauthorizedException } from '@nestjs/common';
import { KafkaService } from '../kafka/kafka.service';
import { KafkaTopics } from '../kafka/kafka.topics';
import { LoginDto } from './dto/login.dto';
import { LogoutSessionDto } from './dto/logout-session.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private readonly kafkaService: KafkaService) {}

  register(
    dto: RegisterDto,
    requestId?: string,
    userAgent?: string,
    deviceName?: string,
    ipAddress?: string,
  ) {
    return this.kafkaService.send(
      KafkaTopics.Auth.Register,
      {
        ...dto,
        metadata: {
          deviceName,
          ipAddress,
          userAgent,
        },
      },
      {
        requestId,
        key: dto.email,
      },
    );
  }

  login(
    dto: LoginDto,
    requestId?: string,
    userAgent?: string,
    deviceName?: string,
    ipAddress?: string,
  ) {
    return this.kafkaService.send(
      KafkaTopics.Auth.Login,
      {
        ...dto,
        metadata: {
          deviceName,
          ipAddress,
          userAgent,
        },
      },
      {
        requestId,
        key: dto.email,
      },
    );
  }

  refresh(dto: RefreshTokenDto, requestId?: string) {
    return this.kafkaService.send(KafkaTopics.Auth.Refresh, dto, {
      requestId,
    });
  }

  logout(dto: RefreshTokenDto, requestId?: string) {
    return this.kafkaService.send(KafkaTopics.Auth.Logout, dto, {
      requestId,
    });
  }

  logoutAll(dto: RefreshTokenDto, requestId?: string) {
    return this.kafkaService.send(KafkaTopics.Auth.LogoutAll, dto, {
      requestId,
    });
  }

  logoutSession(dto: LogoutSessionDto, requestId?: string) {
    return this.kafkaService.send(KafkaTopics.Auth.LogoutSession, dto, {
      requestId,
    });
  }

  getSessions(dto: RefreshTokenDto, requestId?: string) {
    return this.kafkaService.send(KafkaTopics.Auth.Sessions, dto, {
      requestId,
    });
  }

  verifyEmail(token: string, requestId?: string) {
    return this.kafkaService.send(
      KafkaTopics.Auth.VerifyEmail,
      {
        token,
      },
      {
        requestId,
      },
    );
  }

  resendEmailVerification(authorization?: string, requestId?: string) {
    const accessToken = this.extractBearerToken(authorization);

    return this.kafkaService.send(
      KafkaTopics.Auth.ResendEmailVerification,
      {
        accessToken,
      },
      {
        requestId,
      },
    );
  }

  private extractBearerToken(authorization?: string): string {
    if (!authorization) {
      throw new UnauthorizedException('Authorization header отсутствует');
    }

    const [type, token] = authorization.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Некорректный Authorization header');
    }

    return token;
  }
}