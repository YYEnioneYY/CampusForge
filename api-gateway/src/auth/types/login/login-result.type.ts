import { LoginResponseDto } from "../../dto/login-response.dto";

export type LoginResult = {
  body: LoginResponseDto;

  refreshToken: {
    value: string;
    expiresAt: Date;
  };
};