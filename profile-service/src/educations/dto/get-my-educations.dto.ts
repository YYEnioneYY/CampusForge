import {
  IsUUID,
} from 'class-validator';

export class GetMyEducationsDto {
  @IsUUID()
  userId!: string;
}