export const getSessionRevokedKey = (
  sessionId: string,
): string => {
  return `auth:session:revoked:${sessionId}`;
};

export const getUserRevokedAfterKey = (
  userId: string,
): string => {
  return `auth:user:revoked-after:${userId}`;
};