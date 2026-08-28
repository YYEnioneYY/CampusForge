import { plainToInstance, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  Max,
  Min,
  validateSync,
  Matches,
} from 'class-validator';

class EnvironmentVariables {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT!: number;

  @IsString()
  @IsNotEmpty()
  KAFKA_BROKERS!: string;

  @IsString()
  @IsNotEmpty()
  KAFKA_AUTH_CLIENT_ID!: string;

  @IsString()
  @IsNotEmpty()
  KAFKA_AUTH_CONSUMER_GROUP_ID!: string;

  @IsString()
  @IsNotEmpty()
  KAFKA_REFERENCE_CLIENT_ID!: string;

  @IsString()
  @IsNotEmpty()
  KAFKA_REFERENCE_CONSUMER_GROUP_ID!: string;

  @IsString()
  @IsNotEmpty()
  KAFKA_PROFILE_CLIENT_ID!: string;

  @IsString()
  @IsNotEmpty()
  KAFKA_PROFILE_CONSUMER_GROUP_ID!: string;

  @IsString()
  @IsNotEmpty()
  KAFKA_MEDIA_CLIENT_ID!: string;

  @IsString()
  @IsNotEmpty()
  KAFKA_MEDIA_CONSUMER_GROUP_ID!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  TRUST_PROXY_HOPS: number = 0;

  @Type(() => Number)
  @IsInt()
  @Min(1000)
  KAFKA_REQUEST_TIMEOUT_MS!: number;

  @IsIn(['true', 'false'])
  AUTH_COOKIE_SECURE!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(3650)
  DEVICE_ID_COOKIE_MAX_AGE_DAYS!: number;

  @IsString()
  @MinLength(16)
  JWT_ACCESS_SECRET!: string;

  @IsString()
  @Matches(/^rediss?:\/\/.+/)
  REDIS_URL!: string;

  @IsString()
  @Matches(/^https?:\/\/.+/)
  MEDIA_PUBLIC_BASE_URL!: string;
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    config,
    {
      enableImplicitConversion: true,
    },
  );

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}