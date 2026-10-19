export type ReferenceSkillSnapshot = {
  id: string;
  name: string;
  slug: string;
};

export type GetReferenceSkillsResponse = {
  items: ReferenceSkillSnapshot[];
};

export type GetReferenceSkillsPayload = {
  skillIds: string[];
};