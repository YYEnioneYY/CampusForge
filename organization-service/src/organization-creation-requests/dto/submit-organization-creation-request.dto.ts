import {
  IsUUID,
} from 'class-validator';

export class SubmitOrganizationCreationRequestDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  requestId!: string;
}