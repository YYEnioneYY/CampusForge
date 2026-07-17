import { plainToInstance } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
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

  @IsString()
  @MinLength(16)
  JWT_ACCESS_SECRET!: string;

  @IsString()
  @MinLength(16)
  JWT_REFRESH_SECRET!: string;

  @Matches(/^\d+(s|m|h|d)$/)
  JWT_ACCESS_EXPIRES_IN!: string;

  @Matches(/^\d+(s|m|h|d|y)$/)
  JWT_REFRESH_EXPIRES_IN!: string;

  @IsString()
  @MinLength(16)
  REFRESH_TOKEN_HASH_SECRET!: string;

  @Matches(/^\d+$/)
  SESSION_ACTIVITY_UPDATE_INTERVAL_SECONDS!: string;

  @IsUrl({
    require_tld: false,
  })
  FRONTEND_URL!: string;

  @IsString()
  @MinLength(16)
  EMAIL_VERIFICATION_TOKEN_HASH_SECRET!: string;

  @Matches(/^\d+(s|m|h|d)$/)
  EMAIL_VERIFICATION_TOKEN_EXPIRES_IN!: string;

  @Matches(/^\d+$/)
  EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS!: string;

  @IsString()
  @MinLength(16)
  PASSWORD_RESET_TOKEN_HASH_SECRET!: string;

  @Matches(/^\d+(s|m|h|d)$/)
  PASSWORD_RESET_TOKEN_EXPIRES_IN!: string;

  @Matches(/^\d+$/)
  PASSWORD_RESET_REQUEST_COOLDOWN_SECONDS!: string;

  @Matches(/^\d+(s|m|h|d)$/)
  ACCOUNT_RESTORE_TOKEN_EXPIRES_IN!: string;

  @IsString()
  @MinLength(32)
  ACCOUNT_RESTORE_TOKEN_HASH_SECRET!: string;

  @Matches(/^\d+$/)
  ACCOUNT_RESTORE_REQUEST_COOLDOWN_SECONDS!: string;

  @IsString()
  @Matches(/^rediss?:\/\/.+/)
  REDIS_URL!: string;
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