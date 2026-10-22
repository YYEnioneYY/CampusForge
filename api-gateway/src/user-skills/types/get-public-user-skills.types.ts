import type {
  UserSkillKafkaItem,
} from './create-user-skills.types';

export type GetPublicUserSkillsPayload = {
  username: string;
};

export type GetPublicUserSkillsKafkaResponse = {
  skills: UserSkillKafkaItem[];
};