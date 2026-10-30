import type {
  EducationKafkaItem,
} from './get-my-educations.types';

export type UpdateEducationPayload = {
  id: string;
  userId: string;

  institution?: string;
  degree?: string | null;
  fieldOfStudy?: string | null;
  description?: string | null;

  startedAt?: string;
  endedAt?: string | null;
  isCurrent?: boolean;
};

export type UpdateEducationKafkaResponse = {
  education: EducationKafkaItem;
};