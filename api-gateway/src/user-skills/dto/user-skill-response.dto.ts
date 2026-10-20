import {
  ApiProperty,
} from '@nestjs/swagger';

export class UserSkillResponseDto {
  @ApiProperty({
    format: 'uuid',
    description:
      'Идентификатор записи навыка пользователя',
  })
  id!: string;

  @ApiProperty({
    format: 'uuid',
    description:
      'Идентификатор навыка в справочнике',
  })
  skillId!: string;

  @ApiProperty({
    example: 'TypeScript',
  })
  name!: string;

  @ApiProperty({
    example: 'typescript',
  })
  slug!: string;
}