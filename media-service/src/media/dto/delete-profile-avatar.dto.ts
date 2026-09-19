import { IsUUID } from 'class-validator';

export class DeleteProfileAvatarDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  mediaId!: string;
}