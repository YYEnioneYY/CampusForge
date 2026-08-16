import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { GetCountriesDto } from './dto/get-countries.dto';
import { ReferenceLocale } from './enums/reference-locale.enum';
import type { GetCountriesResponse } from './types/get-countries-response.type';

@Injectable()
export class CountryService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getCountries(
    dto: GetCountriesDto,
  ): Promise<GetCountriesResponse> {
    const locale =
      dto.locale ??
      ReferenceLocale.EN;

    const countries =
      await this.prisma.country.findMany({
        where: {
          isActive: true,
        },

        select: {
          code2: true,
          nameEn: true,
          nameRu: true,
        },

        orderBy:
          locale === ReferenceLocale.RU
            ? {
                nameRu: 'asc',
              }
            : {
                nameEn: 'asc',
              },
      });

    return {
      items: countries.map(
        (country) => ({
          code: country.code2,

          name:
            locale ===
            ReferenceLocale.RU
              ? country.nameRu
              : country.nameEn,
        }),
      ),
    };
  }
}