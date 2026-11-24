import type {
  OrganizationCreationRequestKafkaItem,
} from './organization-creation-request.types';

export type CancelOrganizationCreationRequestPayload = {
  userId: string;
  requestId: string;
};

export type CancelOrganizationCreationRequestKafkaResponse = {
  request:
    OrganizationCreationRequestKafkaItem;
};