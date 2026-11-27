import {
  IsUUID,
} from 'class-validator';

export class GetModerationOrganizationCreationRequestDto {
  @IsUUID()
  requestId!: string;
}