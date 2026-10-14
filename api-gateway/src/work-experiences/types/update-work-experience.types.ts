import type {
  WorkExperienceKafkaItem,
} from './get-my-work-experiences.types';

export type UpdateWorkExperiencePayload = {
  id: string;
  userId: string;

  company?: string;
  position?: string;
  description?: string | null;

  startedAt?: string;
  endedAt?: string | null;
  isCurrent?: boolean;
};

export type UpdateWorkExperienceKafkaResponse = {
  workExperience: WorkExperienceKafkaItem;
};