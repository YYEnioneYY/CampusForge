import { Injectable, UnauthorizedException } from '@nestjs/common';
import { KafkaService } from '../kafka/kafka.service';
import { KafkaTopics } from '../kafka/kafka.topics';

@Injectable()
export class UsersService {
  constructor(private readonly kafkaService: KafkaService) {}

  me(authorization?: string, requestId?: string) {
    const accessToken = this.extractBearerToken(authorization);

    return this.kafkaService.send(
      KafkaTopics.Users.Me,
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