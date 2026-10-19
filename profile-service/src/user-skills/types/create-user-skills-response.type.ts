export type UserSkillResponse = {
  id: string;

  skillId: string;
  name: string;
  slug: string;
};

export type CreateUserSkillsResponse = {
  skills: UserSkillResponse[];
};