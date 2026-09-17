import {
  Transform,
} from 'class-transformer';

import {
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class GetPublicProfileDto {
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toLowerCase()
      : value,
  )
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(
    /^[a-z0-9](?:[a-z0-9_]{1,28}[a-z0-9])$/,
    {
      message:
        'Username may contain only lowercase letters, numbers and underscores',
    },
  )
  username!: string;
}