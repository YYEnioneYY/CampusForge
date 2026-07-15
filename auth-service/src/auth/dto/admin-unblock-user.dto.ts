import { IsUUID } from 'class-validator';

export class AdminUnblockUserDto {
  @IsUUID()
  actorUserId!: string;

  @IsUUID()
  targetUserId!: string;
}