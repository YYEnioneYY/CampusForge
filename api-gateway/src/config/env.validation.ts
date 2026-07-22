import { plainToInstance, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
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
  KAFKA_CLIENT_ID!: string;

  @IsString()
  @IsNotEmpty()
  KAFKA_AUTH_CONSUMER_GROUP_ID!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  TRUST_PROXY_HOPS: number = 0;
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