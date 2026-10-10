export class ProfileDataResponseDto {
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

  dateOfBirth!: string | null;

  visibility!: string;
}

export class ProfileResponseDto {
  profile!: ProfileDataResponseDto;
}