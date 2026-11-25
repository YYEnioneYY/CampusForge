import {
  Type,
} from 'class-transformer';

import {
  IsIn,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

import {
  OrganizationCreationRequestStatus,
} from '../../generated/prisma/enums';

const moderationStatuses = [
  OrganizationCreationRequestStatus.SUBMITTED,
  OrganizationCreationRequestStatus.IN_REVIEW,
  OrganizationCreationRequestStatus.APPROVED,
  OrganizationCreationRequestStatus.REJECTED,
  OrganizationCreationRequestStatus.CANCELLED,
];

export class GetModerationOrganizationCreationRequestsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsIn(moderationStatuses)
  status?:
    OrganizationCreationRequestStatus =
      OrganizationCreationRequestStatus.SUBMITTED;
}