export const REFERENCE_PATTERNS = {
  GET_COUNTRIES: 'reference.countries.list',
  GET_COUNTRY: 'reference.countries.get',
} as const;

export const REFERENCE_RESPONSE_PATTERNS = [
  REFERENCE_PATTERNS.GET_COUNTRIES,
  REFERENCE_PATTERNS.GET_COUNTRY,
] as const;