import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsUUID,
} from 'class-validator';

import {
  ApiProperty,
} from '@nestjs/swagger';

import {
  MAX_USER_SKILLS,
} from '../user-skills.constants';

export class CreateUserSkillsDto {
  @ApiProperty({
    type: String,
    isArray: true,
    minItems: 1,
    maxItems: MAX_USER_SKILLS,
    example: [
      '3f914750-cfee-4e25-bfe5-497175a12f19',
      'a7357481-b2e3-45b3-a3e9-03168d0db30e',
    ],
    description:
      'Идентификаторы навыков из справочника',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_USER_SKILLS)
  @ArrayUnique()
  @IsUUID('4', {
    each: true,
  })
  skillIds!: string[];
}