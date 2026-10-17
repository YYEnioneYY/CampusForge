export type SkillSearchItem = {
  id: string;
  name: string;
  slug: string;
};

export type SearchSkillsResponse = {
  items: SkillSearchItem[];
};