export class ProfileDataResponseDto {
  id!: string;

  firstName!: string;
  lastName!: string;
  middleName!: string | null;

  avatarUrl!: string | null;

  bio!: string | null;

  countryCode!: string | null;
  countryName!: string | null;

  dateOfBirth!: string | null;

  visibility!: string;

  createdAt!: string;
  updatedAt!: string;
}

export class ProfileResponseDto {
  profile!: ProfileDataResponseDto;
}