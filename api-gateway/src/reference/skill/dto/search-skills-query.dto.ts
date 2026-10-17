import {
  Transform,
  Type,
} from 'class-transformer';

import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class SearchSkillsQueryDto {
  @ApiProperty({
    example: 'java',
    description:
      'Строка поиска навыка',
    minLength: 1,
    maxLength: 50,
  })
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toLowerCase()
      : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  query!: string;

  @ApiPropertyOptional({
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 20,
    description:
      'Максимальное количество результатов',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  limit: number = 20;
}