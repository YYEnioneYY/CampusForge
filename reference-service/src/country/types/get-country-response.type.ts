export type CountryDetails = {
  code2: string;
  code3: string;

  nameEn: string;
  nameRu: string;
};

export type GetCountryResponse = {
  country: CountryDetails;
};