import {
  Controller,
} from '@nestjs/common';

import {
  MessagePattern,
  Payload,
} from '@nestjs/microservices';

import { REFERENCE_PATTERNS } from '../kafka/patterns/reference-patterns';

import { CountryService } from './country.service';

import type { GetCountriesResponse } from './types/get-countries-response.type';

import { GetCountryDto } from './dto/get-country.dto';
import type { GetCountryResponse } from './types/get-country-response.type';

@Controller()
export class CountryController {
  constructor(
    private readonly countryService:
      CountryService,
  ) {}

  @MessagePattern(REFERENCE_PATTERNS.GET_COUNTRIES)
  getCountries(): Promise<GetCountriesResponse> {
    return this.countryService.getCountries();
  }

  @MessagePattern(REFERENCE_PATTERNS.GET_COUNTRY)
  getCountry(
    @Payload()
    dto: GetCountryDto,
  ): Promise<GetCountryResponse> {
    return this.countryService.getCountry(
      dto,
    );
  }
}