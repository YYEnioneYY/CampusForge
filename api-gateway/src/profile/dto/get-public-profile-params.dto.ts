import {
  PickType,
} from '@nestjs/swagger';

import {
  ChangeUsernameDto,
} from './change-username.dto';

export class GetPublicProfileParamsDto
  extends PickType(
    ChangeUsernameDto,
    ['username'] as const,
  ) {}