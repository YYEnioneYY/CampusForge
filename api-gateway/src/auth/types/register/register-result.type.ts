import { RegisterResponseDto } from "../../dto/register-response.dto";

export type RegisterResult = {
  body: RegisterResponseDto;

  refreshToken: {
    value: string;
    expiresAt: Date;
  };
};