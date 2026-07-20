import { IsUUID } from 'class-validator';

export class AdminRevokeUserSessionsDto {
  @IsUUID()
  actorUserId!: string;

  @IsUUID()
  targetUserId!: string;
}