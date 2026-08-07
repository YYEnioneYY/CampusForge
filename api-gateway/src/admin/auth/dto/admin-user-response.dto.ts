import {
  SystemRole,
} from '../../../common/enums/system-role.enum';
import {
  UserStatus,
} from '../../../common/enums/user-status.enum';

export class AdminUserResponseDto {
  id!: string;
  email!: string;
  role!: SystemRole;
  status!: UserStatus;

  emailVerified!: boolean;
  emailVerifiedAt!: string | null;
  lastLoginAt!: string | null;

  deletedAt!: string | null;
  createdAt!: string;
  updatedAt!: string;
}