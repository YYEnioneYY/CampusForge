import { IsUUID } from 'class-validator';

export class SessionIdParamsDto {
  @IsUUID('4')
  sessionId!: string;
}