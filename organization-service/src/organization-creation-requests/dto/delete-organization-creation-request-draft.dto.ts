import {
  IsUUID,
} from 'class-validator';

export class DeleteOrganizationCreationRequestDraftDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  requestId!: string;
}