import { IsUUID } from 'class-validator';

export class DeleteMyAvatarDto {
  @IsUUID()
  userId!: string;
}