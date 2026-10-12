export type WorkExperienceResponse = {
  id: string;

  company: string;
  position: string;
  description: string | null;

  startedAt: string;
  endedAt: string | null;
  isCurrent: boolean;
};

export type GetMyWorkExperiencesResponse = {
  workExperiences: WorkExperienceResponse[];
};