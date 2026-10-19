export type SkillByIdResponse = {
  id: string;
  name: string;
  slug: string;
};

export type GetSkillsByIdsResponse = {
  items: SkillByIdResponse[];
};