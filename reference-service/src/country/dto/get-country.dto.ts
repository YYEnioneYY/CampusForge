import {
  Transform,
} from 'class-transformer';

import {
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class GetCountryDto {
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toUpperCase()
      : value,
  )
  @IsString()
  @Length(2, 2)
  @Matches(/^[A-Z]{2}$/)
  code!: string;
}