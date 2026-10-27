export type GetMyEducationsPayload = {
  userId: string;
};

export type EducationKafkaItem = {
  id: string;

  institution: string;
  degree: string | null;
  fieldOfStudy: string | null;
  description: string | null;

  startedAt: string;
  endedAt: string | null;
  isCurrent: boolean;
};

export type GetMyEducationsKafkaResponse = {
  educations: EducationKafkaItem[];
};