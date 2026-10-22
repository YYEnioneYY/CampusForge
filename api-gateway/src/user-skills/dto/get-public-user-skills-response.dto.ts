import {
  ApiProperty,
} from '@nestjs/swagger';

import {
  UserSkillResponseDto,
} from './user-skill-response.dto';

export class GetPublicUserSkillsResponseDto {
  @ApiProperty({
    type: UserSkillResponseDto,
    isArray: true,
  })
  skills!: UserSkillResponseDto[];
}