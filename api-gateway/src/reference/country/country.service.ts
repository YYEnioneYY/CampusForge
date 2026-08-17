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

import type {
  GetCountriesKafkaResponse,
} from './types/get-countries-kafka-response.type';

@Injectable()
export class CountryService {
  constructor(
    private readonly referenceKafkaService:
      ReferenceKafkaService,
  ) {}

  async getCountries(): Promise<GetCountriesKafkaResponse> {
    return firstValueFrom(
      this.referenceKafkaService.send<
        GetCountriesKafkaResponse,
        Record<string, never>
      >(
        REFERENCE_PATTERNS.GET_COUNTRIES,
        {},
      ),
    );
  }
}