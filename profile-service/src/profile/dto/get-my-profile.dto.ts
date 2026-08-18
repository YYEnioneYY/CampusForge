import { IsUUID } from 'class-validator';

export class GetMyProfileDto {
  @IsUUID()
  userId!: string;
}