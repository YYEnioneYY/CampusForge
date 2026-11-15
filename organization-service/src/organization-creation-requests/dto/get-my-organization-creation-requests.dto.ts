import {
  IsUUID,
} from 'class-validator';

export class GetMyOrganizationCreationRequestsDto {
  @IsUUID()
  userId!: string;
}