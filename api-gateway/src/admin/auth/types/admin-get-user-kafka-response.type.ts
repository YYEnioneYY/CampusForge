import {
  SystemRole,
} from '../../../common/enums/system-role.enum';

export type AdminGetUserKafkaResponse = {
  user: {
    id: string;
    email: string;

    role: SystemRole;
    status: string;

    emailVerified: boolean;
    emailVerifiedAt: string | null;

    lastLoginAt: string | null;
    deletedAt: string | null;

    createdAt: string;
    updatedAt: string;

    activeSessionsCount: number;
  };
};