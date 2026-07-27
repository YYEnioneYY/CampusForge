import { RefreshResponseDto } from '../../dto/refresh-response.dto';

export type RefreshResult = {
  body: RefreshResponseDto;

  refreshToken: {
    value: string;
    expiresAt: Date;
  };
};