import {
  IsUUID,
} from 'class-validator';

export class CancelOrganizationCreationRequestDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  requestId!: string;
}