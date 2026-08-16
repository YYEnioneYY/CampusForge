import {
  Controller,
} from '@nestjs/common';

import {
  MessagePattern,
  Payload,
} from '@nestjs/microservices';

import { REFERENCE_PATTERNS } from '../kafka/patterns/reference-patterns';

import { CountryService } from './country.service';

import { GetCountriesDto } from './dto/get-countries.dto';
import type { GetCountriesResponse } from './types/get-countries-response.type';

@Controller()
export class CountryController {
  constructor(
    private readonly countryService:
      CountryService,
  ) {}

  @MessagePattern(REFERENCE_PATTERNS.GET_COUNTRIES)
  getCountries(
    @Payload()
    dto: GetCountriesDto,
  ): Promise<GetCountriesResponse> {
    return this.countryService.getCountries(
      dto,
    );
  }
}