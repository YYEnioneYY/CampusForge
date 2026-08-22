import {
  IsIn,
  IsUUID,
} from 'class-validator';

export const MEDIA_OWNER_TYPES = [
  'user',
  'organization',
  'project',
] as const;

export const MEDIA_PURPOSES = [
  'profile_avatar',
] as const;

export class MediaFileReadyDto {
  @IsUUID()
  mediaId!: string;

  @IsIn(MEDIA_OWNER_TYPES)
  ownerType!:
    (typeof MEDIA_OWNER_TYPES)[number];

  @IsUUID()
  ownerId!: string;

  @IsIn(MEDIA_PURPOSES)
  purpose!:
    (typeof MEDIA_PURPOSES)[number];
}