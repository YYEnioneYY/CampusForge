import {
  Transform,
  Type,
} from 'class-transformer';

import {
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class SearchProfilesQueryDto {
  @Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }

    return value
      .trim()
      .replace(/^@/, '')
      .replace(/\s+/g, ' ');
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  q!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 20;
}