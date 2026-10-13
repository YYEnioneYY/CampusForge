import type {
  WorkExperienceKafkaItem,
} from './get-my-work-experiences.types';

export type CreateWorkExperiencePayload = {
  userId: string;

  company: string;
  position: string;
  description?: string | null;

  startedAt: string;
  endedAt?: string | null;
  isCurrent: boolean;
};

export type CreateWorkExperienceKafkaResponse = {
  workExperience: WorkExperienceKafkaItem;
};