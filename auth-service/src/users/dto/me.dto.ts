import { IsString, MinLength } from 'class-validator';

export class MeDto {
  @IsString()
  @MinLength(20)
  accessToken!: string;
}