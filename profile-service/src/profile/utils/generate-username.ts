export function generateUsername(
  userId: string,
): string {
  const hex = userId.replaceAll('-', '');

  const value = BigInt(`0x${hex}`);

  return `user_${value.toString(36)}`;
}