export type EducationResponse = {
  id: string;

  institution: string;
  degree: string | null;
  fieldOfStudy: string | null;
  description: string | null;

  startedAt: string;
  endedAt: string | null;
  isCurrent: boolean;
};

export type GetMyEducationsResponse = {
  educations: EducationResponse[];
};