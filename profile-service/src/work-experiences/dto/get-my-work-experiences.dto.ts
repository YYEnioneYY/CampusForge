import {
  IsUUID,
} from 'class-validator';

export class GetMyWorkExperiencesDto {
  @IsUUID()
  userId!: string;
}