export class SearchProfileItemResponseDto {
  userId!: string;

  username!: string;

  firstName!: string;
  lastName!: string;
  middleName!: string | null;

  avatarUrl!: string | null;
}

export class SearchProfilesPaginationMetaDto {
  page!: number;
  limit!: number;

  total!: number;
  totalPages!: number;

  hasNextPage!: boolean;
  hasPreviousPage!: boolean;
}

export class SearchProfilesResponseDto {
  items!: SearchProfileItemResponseDto[];

  meta!: SearchProfilesPaginationMetaDto;
}