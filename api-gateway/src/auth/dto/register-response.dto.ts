export class RegisteredUserResponseDto {
  id!: string;
  email!: string;
  systemRole!: string;
  status!: string;
  emailVerifiedAt!: string | null;
  createdAt!: string;
}

export class RegisterResponseDto {
  accessToken!: string;
  accessTokenExpiresAt!: string;
  user!: RegisteredUserResponseDto;
}