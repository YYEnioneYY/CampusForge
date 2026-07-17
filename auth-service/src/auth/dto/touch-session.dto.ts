import { IsUUID } from 'class-validator';

export class TouchSessionDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  sessionId!: string;
}