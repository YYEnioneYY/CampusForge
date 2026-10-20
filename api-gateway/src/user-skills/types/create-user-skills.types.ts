export type CreateUserSkillsPayload = {
  userId: string;
  skillIds: string[];
};

export type UserSkillKafkaItem = {
  id: string;
  skillId: string;
  name: string;
  slug: string;
};

export type CreateUserSkillsKafkaResponse = {
  skills: UserSkillKafkaItem[];
};