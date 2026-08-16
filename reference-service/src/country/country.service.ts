import { Injectable } from '@nestjs/common';

import { throwRpcError } from 'src/common/rpc/throw-rpc-error';
import { RpcErrorCode } from 'src/common/rpc/rpc-error-code';

import { PrismaService } from '../prisma/prisma.service';

import { GetCountriesDto } from './dto/get-countries.dto';
import { ReferenceLocale } from './enums/reference-locale.enum';
import type { GetCountriesResponse } from './types/get-countries-response.type';

import { GetCountryDto } from './dto/get-country.dto';
import type { GetCountryResponse } from './types/get-country-response.type';

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

  async getCountry(
    dto: GetCountryDto,
  ): Promise<GetCountryResponse> {
    const country =
      await this.prisma.country.findUnique({
        where: {
          code2: dto.code,
        },
  
        select: {
          code2: true,
          code3: true,
  
          nameEn: true,
          nameRu: true,
  
          isActive: true,
        },
      });
  
    if (
      !country ||
      !country.isActive
    ) {
      throwRpcError(
        RpcErrorCode.COUNTRY_NOT_FOUND,
        'Country not found',
      );
    }
  
    return {
      country: {
        code2: country.code2,
        code3: country.code3,
  
        nameEn: country.nameEn,
        nameRu: country.nameRu,
      },
    };
  }
}