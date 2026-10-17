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
  SearchSkillsQueryDto,
} from './dto/search-skills-query.dto';

import type {
  SearchSkillsKafkaResponse,
} from './types/search-skills-kafka-response.type';

import type {
  SearchSkillsPayload,
} from './types/search-skills-payload.type';

@Injectable()
export class SkillService {
  constructor(
    private readonly referenceKafkaService:
      ReferenceKafkaService,
  ) {}

  async searchSkills(
    dto: SearchSkillsQueryDto,
  ): Promise<SearchSkillsKafkaResponse> {
    const payload: SearchSkillsPayload = {
      query: dto.query,
      limit: dto.limit,
    };

    return firstValueFrom(
      this.referenceKafkaService.send<
        SearchSkillsKafkaResponse,
        SearchSkillsPayload
      >(
        REFERENCE_PATTERNS.SEARCH_SKILLS,
        payload,
      ),
    );
  }
}