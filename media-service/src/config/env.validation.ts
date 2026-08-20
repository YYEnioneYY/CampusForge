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

  @IsString()
  @MinLength(1)
  S3_INTERNAL_ENDPOINT!: string;
  
  @IsString()
  @MinLength(1)
  S3_UPLOAD_PUBLIC_ENDPOINT!: string;
  
  @IsString()
  @MinLength(1)
  S3_REGION!: string;
  
  @IsString()
  @MinLength(1)
  S3_ACCESS_KEY!: string;
  
  @IsString()
  @MinLength(1)
  S3_SECRET_KEY!: string;
  
  @IsString()
  @MinLength(1)
  S3_PUBLIC_BUCKET!: string;
  
  @Type(() => Number)
  @IsInt()
  @Min(60)
  S3_UPLOAD_URL_EXPIRES_IN!: number;
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