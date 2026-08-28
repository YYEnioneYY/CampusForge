import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class ChangeProfileVisibilityDto {
  @IsString()
  @IsNotEmpty()
  visibility!: string;
}