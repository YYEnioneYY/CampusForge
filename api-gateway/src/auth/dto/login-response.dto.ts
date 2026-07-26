export class LoggedInUserResponseDto {
  id!: string;
  email!: string;
  systemRole!: string;
  status!: string;
  emailVerifiedAt!: string | null;
  createdAt!: string;
}

export class LoginResponseDto {
  accessToken!: string;
  accessTokenExpiresAt!: string;
  user!: LoggedInUserResponseDto;
}