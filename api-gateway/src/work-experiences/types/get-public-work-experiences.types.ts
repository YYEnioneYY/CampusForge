import type {
  WorkExperienceKafkaItem,
} from './get-my-work-experiences.types';

export type GetPublicWorkExperiencesPayload = {
  username: string;
};

export type GetPublicWorkExperiencesKafkaResponse = {
  workExperiences:
    WorkExperienceKafkaItem[];
};