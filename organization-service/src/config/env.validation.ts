import {
  plainToInstance,
} from 'class-transformer';

import {
  IsNotEmpty,
  IsString,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;
}

export function validateEnv(
  config: Record<string, unknown>,
) {
  const validatedConfig =
    plainToInstance(
      EnvironmentVariables,
      config,
      {
        enableImplicitConversion:
          false,
      },
    );

  const errors =
    validateSync(
      validatedConfig,
      {
        skipMissingProperties:
          false,
      },
    );

  if (errors.length > 0) {
    const messages =
      errors
        .map((error) => {
          const constraints =
            error.constraints
              ? Object
                  .values(
                    error.constraints,
                  )
                  .join(', ')
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