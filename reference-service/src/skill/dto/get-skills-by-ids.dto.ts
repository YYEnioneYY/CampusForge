import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsUUID,
} from 'class-validator';

import {
  MAX_SKILLS_BY_IDS,
} from '../skill.constants';

export class GetSkillsByIdsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_SKILLS_BY_IDS)
  @ArrayUnique()
  @IsUUID('4', {
    each: true,
  })
  skillIds!: string[];
}