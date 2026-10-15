import {
  IsUUID,
} from 'class-validator';

export class DeleteWorkExperienceDto {
  @IsUUID()
  id!: string;

  @IsUUID()
  userId!: string;
}