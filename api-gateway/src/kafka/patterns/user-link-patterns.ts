export const USER_LINK_PATTERNS = {
  GET_MY: 'profile.links.me',
} as const;

export const USER_LINK_RESPONSE_PATTERNS = [
  USER_LINK_PATTERNS.GET_MY,
] as const;