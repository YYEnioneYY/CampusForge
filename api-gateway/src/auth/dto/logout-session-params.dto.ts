import { IsUUID } from 'class-validator';

export class LogoutSessionParamsDto {
  @IsUUID('4')
  sessionId!: string;
}