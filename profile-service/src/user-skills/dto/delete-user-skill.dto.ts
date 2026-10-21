import {
  IsUUID,
} from 'class-validator';

export class DeleteUserSkillDto {
  @IsUUID()
  id!: string;

  @IsUUID()
  userId!: string;
}