import {
  IsUUID,
} from 'class-validator';

export class DeleteUserLinkDto {
  @IsUUID()
  id!: string;

  @IsUUID()
  userId!: string;
}