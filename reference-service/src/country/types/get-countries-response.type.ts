export type CountryListItem = {
  code: string;
  name: string;
};

export type GetCountriesResponse = {
  items: CountryListItem[];
};