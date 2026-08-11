import { SystemRole } from '../../../common/enums/system-role.enum';

export type AdminChangeUserRoleKafkaPayload = {
  actorUserId: string;
  targetUserId: string;
  newRole: SystemRole;
};