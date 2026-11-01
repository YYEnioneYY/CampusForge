import type {
  EducationKafkaItem,
} from './get-my-educations.types';

export type GetPublicEducationsPayload = {
  username: string;
};

export type GetPublicEducationsKafkaResponse = {
  educations: EducationKafkaItem[];
};