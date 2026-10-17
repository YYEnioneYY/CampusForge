import {
  ApiProperty,
} from '@nestjs/swagger';

export class SkillListItemResponseDto {
  @ApiProperty({
    format: 'uuid',
    example:
      '6d501244-711c-46f7-8b40-b615716ebf1f',
  })
  id!: string;

  @ApiProperty({
    example: 'JavaScript',
  })
  name!: string;

  @ApiProperty({
    example: 'javascript',
  })
  slug!: string;
}