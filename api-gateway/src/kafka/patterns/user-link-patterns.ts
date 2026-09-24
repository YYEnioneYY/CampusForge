export const USER_LINK_PATTERNS = {
  GET_MY: 'profile.links.me',
  CREATE: 'profile.links.create',
} as const;

export const USER_LINK_RESPONSE_PATTERNS = [
  USER_LINK_PATTERNS.GET_MY,
  USER_LINK_PATTERNS.CREATE,
] as const;