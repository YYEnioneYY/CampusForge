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

export class SearchSkillsDto {
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value
          .trim()
          .replace(/\s+/g, ' ')
          .toLowerCase()
      : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  query!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit: number = 20;
}