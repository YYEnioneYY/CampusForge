class PublicProfileDto {
  userId!: string;
  username!: string;

  firstName!: string;
  lastName!: string;
  middleName!: string | null;

  avatarUrl!: string | null;

  bio!: string | null;

  headline!: string | null;
  position!: string | null;
  company!: string | null;
  timeZone!: string | null;

  countryCode!: string | null;
  countryName!: string | null;

  isPrivate!: boolean;
}

export class PublicProfileResponseDto {
  profile!: PublicProfileDto;
}