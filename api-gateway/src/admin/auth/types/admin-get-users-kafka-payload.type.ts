import {
  SystemRole,
} from '../../../common/enums/system-role.enum';
import {
  UserStatus,
} from '../../../common/enums/user-status.enum';

export type AdminGetUsersKafkaPayload = {
  actorUserId: string;

  page?: number;
  limit?: number;

  search?: string;
  status?: UserStatus;
  role?: SystemRole;
};