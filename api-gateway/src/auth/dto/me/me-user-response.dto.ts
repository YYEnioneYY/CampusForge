export class MeUserResponseDto {
  id!: string;

  email!: string;

  role!: string;

  status!: string;

  emailVerified!: boolean;

  emailVerifiedAt!: string | null;

  lastLoginAt!: string | null;

  createdAt!: string;

  updatedAt!: string;
}