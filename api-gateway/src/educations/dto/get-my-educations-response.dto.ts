export class EducationResponseDto {
  id!: string;

  institution!: string;
  degree!: string | null;
  fieldOfStudy!: string | null;
  description!: string | null;

  startedAt!: string;
  endedAt!: string | null;
  isCurrent!: boolean;
}

export class GetMyEducationsResponseDto {
  educations!: EducationResponseDto[];
}