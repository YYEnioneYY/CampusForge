import {
  PaginationMetaDto,
} from '../../../common/dto/pagination-meta.dto';

import {
  ModerationOrganizationCreationRequestListItemDto,
} from './moderation-organization-creation-request-list-item.dto';

export class GetOrganizationCreationRequestsResponseDto {
  items!:
    ModerationOrganizationCreationRequestListItemDto[];

  meta!:
    PaginationMetaDto;
}