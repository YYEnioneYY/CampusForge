import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';

import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import {
  CountryService,
} from './country.service';

import {
  GetCountriesQueryDto,
} from './dto/get-countries-query.dto';

import {
  GetCountriesResponseDto,
} from './dto/get-countries-response.dto';

@ApiTags('Reference')
@Controller('reference/countries')
export class CountryController {
  constructor(
    private readonly countryService:
      CountryService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'Список доступных стран',
  })
  getCountries(
    @Query()
    query: GetCountriesQueryDto,
  ): Promise<GetCountriesResponseDto> {
    return this.countryService.getCountries(query);
  }
}