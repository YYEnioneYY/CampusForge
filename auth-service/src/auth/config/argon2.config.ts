import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';

export function getArgon2Options(configService: ConfigService): argon2.Options {
  return {
    type: getArgon2Type(configService),
    memoryCost: getNumberConfig(configService, 'ARGON2_MEMORY_COST', 19456),
    timeCost: getNumberConfig(configService, 'ARGON2_TIME_COST', 2),
    parallelism: getNumberConfig(configService, 'ARGON2_PARALLELISM', 1),
  };
}

function getArgon2Type(configService: ConfigService) {
  const type = configService
    .get<string>('ARGON2_TYPE', 'argon2id')
    .toLowerCase();

  switch (type) {
    case 'argon2i':
      return argon2.argon2i;

    case 'argon2d':
      return argon2.argon2d;

    case 'argon2id':
    default:
      return argon2.argon2id;
  }
}

function getNumberConfig(
  configService: ConfigService,
  name: string,
  defaultValue: number,
): number {
  const value = configService.get<string>(name);

  if (!value) {
    return defaultValue;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return defaultValue;
  }

  return parsed;
}