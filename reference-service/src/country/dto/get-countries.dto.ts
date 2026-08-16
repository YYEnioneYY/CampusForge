import {
  IsEnum,
  IsOptional,
} from 'class-validator';

import {
  ReferenceLocale,
} from '../enums/reference-locale.enum';

export class GetCountriesDto {
  @IsOptional()
  @IsEnum(ReferenceLocale)
  locale?: ReferenceLocale =
    ReferenceLocale.EN;
}