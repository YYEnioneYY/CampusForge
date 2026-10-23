import type {
  UserSkillKafkaItem,
} from './create-user-skills.types';

export type GetMyUserSkillsPayload = {
  userId: string;
};

export type GetMyUserSkillsKafkaResponse = {
  skills: UserSkillKafkaItem[];
};