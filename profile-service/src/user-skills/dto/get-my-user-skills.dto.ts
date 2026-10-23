import {
  IsUUID,
} from 'class-validator';

export class GetMyUserSkillsDto {
  @IsUUID('4')
  userId!: string;
}