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
  getCountries(): Promise<GetCountriesResponseDto> {
    return this.countryService.getCountries();
  }
}