import { IsUUID } from 'class-validator';

export class CreateProfileAvatarUploadDto {
  @IsUUID()
  userId!: string;
}