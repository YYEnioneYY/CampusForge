import { IsUUID } from 'class-validator';

export class GetMyLinksDto {
  @IsUUID()
  userId!: string;
}