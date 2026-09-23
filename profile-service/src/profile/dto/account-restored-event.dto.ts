import {
  IsDateString,
  IsUUID,
} from 'class-validator';

export class AccountRestoredEventDto {
  @IsUUID()
  userId!: string;

  @IsDateString()
  restoredAt!: string;
}