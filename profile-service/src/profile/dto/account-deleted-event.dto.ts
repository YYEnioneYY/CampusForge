import {
  IsDateString,
  IsUUID,
} from 'class-validator';

export class AccountDeletedEventDto {
  @IsUUID()
  userId!: string;

  @IsDateString()
  deletedAt!: string;
}