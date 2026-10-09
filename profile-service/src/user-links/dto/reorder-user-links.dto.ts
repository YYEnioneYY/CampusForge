import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsUUID,
} from 'class-validator';

import { MAX_USER_LINKS } from '../user-links.constants';

export class ReorderUserLinksDto {
  @IsUUID('4')
  userId!: string;

  @IsArray()
  @IsUUID('4', {
    each: true,
  })
  @ArrayUnique()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_USER_LINKS)
  orderedLinkIds!: string[];
}