export const REFERENCE_PATTERNS = {
  GET_COUNTRY: 'reference.countries.get',

  GET_SKILLS_BY_IDS: 'reference.skills.get-by-ids',
} as const;

export const REFERENCE_RESPONSE_PATTERNS = [
  REFERENCE_PATTERNS.GET_COUNTRY,

  REFERENCE_PATTERNS.GET_SKILLS_BY_IDS,
] as const;