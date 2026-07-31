export class SessionResponseDto {
  id!: string;
  deviceName!: string | null;
  sessionName!: string | null;
  ipAddress!: string | null;
  userAgent!: string | null;

  lastSeenAt!: string;
  createdAt!: string;
  isCurrent!: boolean;
}