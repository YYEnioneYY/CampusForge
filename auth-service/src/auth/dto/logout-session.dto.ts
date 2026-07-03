import { IsUUID } from 'class-validator';

export class LogoutSessionDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  sessionId!: string;
}