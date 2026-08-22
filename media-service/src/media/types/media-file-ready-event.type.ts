export type MediaFileReadyEvent = {
  mediaId: string;

  ownerType:
    | 'user'
    | 'organization'
    | 'project';

  ownerId: string;

  purpose:
    | 'profile_avatar';
};