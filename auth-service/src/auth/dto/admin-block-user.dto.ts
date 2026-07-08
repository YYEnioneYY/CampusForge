import { IsUUID } from 'class-validator';

export class AdminBlockUserDto {
  @IsUUID()
  actorUserId!: string;

  @IsUUID()
  targetUserId!: string;
}