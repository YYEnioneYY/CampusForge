import type {
  OrganizationCreationRequestKafkaItem,
} from './organization-creation-request.types';

export type GetMyOrganizationCreationRequestsPayload = {
  userId: string;
};

export type GetMyOrganizationCreationRequestsKafkaResponse = {
  requests:
    OrganizationCreationRequestKafkaItem[];
};