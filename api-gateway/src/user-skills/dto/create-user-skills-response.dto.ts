import {
  ApiProperty,
} from '@nestjs/swagger';

import {
  UserSkillResponseDto,
} from './user-skill-response.dto';

export class CreateUserSkillsResponseDto {
  @ApiProperty({
    type: UserSkillResponseDto,
    isArray: true,
  })
  skills!: UserSkillResponseDto[];
}