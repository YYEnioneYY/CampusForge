export class UpdatedProfileDataDto {
  username!: string;

  firstName!: string;
  lastName!: string;
  middleName!: string | null;

  bio!: string | null;

  countryCode!: string | null;
  countryName!: string | null;

  dateOfBirth!: string | null;

  visibility!: string;
}

export class UpdateMyProfileResponseDto {
  profile!: UpdatedProfileDataDto;
}