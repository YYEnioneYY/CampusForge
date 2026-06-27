import { createHmac, randomBytes } from 'crypto';

export function generateEmailVerificationToken(): string {
  return randomBytes(32).toString('hex');
}

export function hashEmailVerificationToken(
  token: string,
  secret: string,
): string {
  return createHmac('sha256', secret).update(token).digest('hex');
}