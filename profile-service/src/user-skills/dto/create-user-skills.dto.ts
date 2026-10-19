import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsUUID,
} from 'class-validator';

import {
  MAX_USER_SKILLS,
} from '../user-skills.constants';

export class CreateUserSkillsDto {
  @IsUUID()
  userId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_USER_SKILLS)
  @ArrayUnique()
  @IsUUID('4', {
    each: true,
  })
  skillIds!: string[];
}