import { IsUUID } from 'class-validator';

export class AdminGetUserDto {
  @IsUUID()
  actorUserId!: string;

  @IsUUID()
  targetUserId!: string;
}