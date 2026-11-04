import {
  plainToInstance,
  Type,
} from 'class-transformer';

import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsOptional()
  @IsIn([
    'development',
    'production',
    'test',
  ])
  NODE_ENV?: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsString()
  @IsNotEmpty()
  KAFKA_BROKERS!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  KAFKA_CLIENT_ID?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  KAFKA_GROUP_ID?: string;
}

export function validateEnv(
  config: Record<string, unknown>,
) {
  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    config,
    {
      enableImplicitConversion: false,
    },
  );

  const errors = validateSync(
    validatedConfig,
    {
      skipMissingProperties: false,
    },
  );

  if (errors.length > 0) {
    const messages = errors
      .map((error) => {
        const constraints = error.constraints
          ? Object.values(error.constraints).join(', ')
          : 'Invalid value';

        return `${error.property}: ${constraints}`;
      })
      .join('\n');

    throw new Error(
      `Environment validation failed:\n${messages}`,
    );
  }

  return validatedConfig;
}