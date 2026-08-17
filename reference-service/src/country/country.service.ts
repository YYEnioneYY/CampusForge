import { Injectable } from '@nestjs/common';

import { throwRpcError } from 'src/common/rpc/throw-rpc-error';
import { RpcErrorCode } from 'src/common/rpc/rpc-error-code';

import { PrismaService } from '../prisma/prisma.service';

import type { GetCountriesResponse } from './types/get-countries-response.type';

import { GetCountryDto } from './dto/get-country.dto';
import type { GetCountryResponse } from './types/get-country-response.type';

@Injectable()
export class CountryService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getCountries(): Promise<GetCountriesResponse> {
    const countries =
      await this.prisma.country.findMany({
        where: {
          isActive: true,
        },

        select: {
          code2: true,
          name: true,
        },

        orderBy: {
          name: 'asc',
        },
      });

    return {
      items: countries.map(
        (country) => ({
          code: country.code2,
          name: country.name,
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
  
          name: true,
  
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
        name: country.name,
      },
    };
  }
}