import {
  AdminUserResponseDto,
} from './admin-user-response.dto';
import {
  AdminUsersPaginationMetaDto,
} from './admin-users-pagination-meta.dto';

export class AdminGetUsersResponseDto {
  items!: AdminUserResponseDto[];

  meta!: AdminUsersPaginationMetaDto;
}