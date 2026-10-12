export type GetMyWorkExperiencesPayload = {
  userId: string;
};

export type WorkExperienceKafkaItem = {
  id: string;

  company: string;
  position: string;
  description: string | null;

  startedAt: string;
  endedAt: string | null;
  isCurrent: boolean;
};

export type GetMyWorkExperiencesKafkaResponse = {
  workExperiences: WorkExperienceKafkaItem[];
};