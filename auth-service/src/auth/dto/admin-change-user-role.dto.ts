import { IsEnum, IsUUID } from 'class-validator';
import { SystemRole } from '../../generated/prisma/client';

export class AdminChangeUserRoleDto {
  @IsUUID()
  actorUserId!: string;

  @IsUUID()
  targetUserId!: string;

  @IsEnum(SystemRole)
  newRole!: SystemRole;
}