import {
  Injectable,
} from '@nestjs/common';

import {
  firstValueFrom,
} from 'rxjs';

import {
  ReferenceKafkaService,
} from '../../kafka/reference-kafka.service';

import {
  REFERENCE_PATTERNS,
} from '../../kafka/patterns/reference-patterns';

import {
  GetCountriesQueryDto,
} from './dto/get-countries-query.dto';

import type {
  GetCountriesKafkaPayload,
} from './types/get-countries-kafka-payload.type';

import type {
  GetCountriesKafkaResponse,
} from './types/get-countries-kafka-response.type';

@Injectable()
export class CountryService {
  constructor(
    private readonly referenceKafkaService:
      ReferenceKafkaService,
  ) {}

  async getCountries(
    query: GetCountriesQueryDto,
  ): Promise<GetCountriesKafkaResponse> {
    const payload: GetCountriesKafkaPayload = {
      locale: query.locale,
    };

    return firstValueFrom(
      this.referenceKafkaService.send<
        GetCountriesKafkaResponse,
        GetCountriesKafkaPayload
      >(
        REFERENCE_PATTERNS.GET_COUNTRIES,
        payload,
      ),
    );
  }
}