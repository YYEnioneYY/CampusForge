import { CreateRefreshTokenSessionInput } from './create-refresh-token-session.input';

export type RotateRefreshTokenSessionInput = {
  oldSessionId: string;
  newSession: CreateRefreshTokenSessionInput;
};