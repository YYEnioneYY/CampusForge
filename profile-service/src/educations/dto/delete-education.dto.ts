import {
  IsUUID,
} from 'class-validator';

export class DeleteEducationDto {
  @IsUUID()
  id!: string;

  @IsUUID()
  userId!: string;
}