import { plainToInstance, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsInt,
  Min,
  Matches,
  MinLength,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsOptional()
  @IsString()
  NODE_ENV?: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsString()
  @IsNotEmpty()
  KAFKA_BROKERS!: string;

  @IsOptional()
  @IsString()
  KAFKA_CLIENT_ID?: string;

  @IsOptional()
  @IsString()
  KAFKA_GROUP_ID?: string;

  @Type(() => Number)
  @IsInt()
  @Min(100)
  KAFKA_REQUEST_TIMEOUT_MS!: number;
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: false,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const messages = errors
      .map((error) => {
        const constraints = error.constraints
          ? Object.values(error.constraints).join(', ')
          : 'Invalid value';

        return `${error.property}: ${constraints}`;
      })
      .join('\n');

    throw new Error(`Environment validation failed:\n${messages}`);
  }

  return validatedConfig;
}