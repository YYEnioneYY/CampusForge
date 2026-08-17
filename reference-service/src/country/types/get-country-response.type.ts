export type CountryDetails = {
  code2: string;
  code3: string;
  name: string;
};

export type GetCountryResponse = {
  country: CountryDetails;
};