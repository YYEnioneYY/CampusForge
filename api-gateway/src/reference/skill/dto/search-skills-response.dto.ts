import {
  ApiProperty,
} from '@nestjs/swagger';

import {
  SkillListItemResponseDto,
} from './skill-list-item-response.dto';

export class SearchSkillsResponseDto {
  @ApiProperty({
    type: SkillListItemResponseDto,
    isArray: true,
  })
  items!: SkillListItemResponseDto[];
}