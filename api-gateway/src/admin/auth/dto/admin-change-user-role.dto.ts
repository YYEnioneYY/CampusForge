import { IsEnum } from 'class-validator';

import { SystemRole } from '../../../common/enums/system-role.enum';

export class AdminChangeUserRoleDto {
  @IsEnum(SystemRole)
  newRole!: SystemRole;
}