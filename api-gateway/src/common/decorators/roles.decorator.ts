import { SetMetadata } from '@nestjs/common';

import { SystemRole } from '../enums/system-role.enum';

export const ROLES_KEY = 'required_roles';

export const Roles = (
  ...roles: SystemRole[]
): MethodDecorator & ClassDecorator => {
  return SetMetadata(ROLES_KEY, roles);
};