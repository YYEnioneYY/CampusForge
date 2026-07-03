import { IsOptional, IsUUID } from 'class-validator';

export class GetSessionsDto {
  @IsUUID()
  userId!: string;

  @IsOptional()
  @IsUUID()
  currentSessionId?: string;
}