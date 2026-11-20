import type {
  OrganizationCreationRequestKafkaItem,
} from './organization-creation-request.types';

export type SubmitOrganizationCreationRequestPayload = {
  userId: string;
  requestId: string;
};

export type SubmitOrganizationCreationRequestKafkaResponse = {
  request: OrganizationCreationRequestKafkaItem;
};