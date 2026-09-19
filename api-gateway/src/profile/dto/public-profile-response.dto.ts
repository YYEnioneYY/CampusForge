class PublicProfileDto {
  userId!: string;
  username!: string;

  firstName!: string;
  lastName!: string;
  middleName!: string | null;

  avatarUrl!: string | null;

  bio!: string | null;

  countryCode!: string | null;
  countryName!: string | null;
}

export class PublicProfileResponseDto {
  profile!: PublicProfileDto;
}