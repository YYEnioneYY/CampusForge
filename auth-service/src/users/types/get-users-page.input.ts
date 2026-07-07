import { UserStatus, SystemRole } from "../../generated/prisma/client";

export type GetUsersPageInput = {
  page?: number;
  limit?: number;
  search?: string;
  status?: UserStatus;
  role?: SystemRole;
};