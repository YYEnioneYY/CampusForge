export class WorkExperienceResponseDto {
  id!: string;

  company!: string;
  position!: string;
  description!: string | null;

  startedAt!: string;
  endedAt!: string | null;
  isCurrent!: boolean;
}

export class GetMyWorkExperiencesResponseDto {
  workExperiences!: WorkExperienceResponseDto[];
}