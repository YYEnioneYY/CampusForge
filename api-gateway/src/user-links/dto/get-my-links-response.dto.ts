import {
  UserLinkType,
} from '../types/get-my-links.types';

export class UserLinkResponseDto {
  id!: string;

  type!: UserLinkType;

  url!: string;
  title!: string;

  sortOrder!: number;
}

export class GetMyLinksResponseDto {
  links!: UserLinkResponseDto[];
}