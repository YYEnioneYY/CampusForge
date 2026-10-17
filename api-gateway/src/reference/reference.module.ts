import { Module } from '@nestjs/common';
import { CountryModule } from './country/country.module';
import { SkillModule } from './skill/skill.module';

@Module({
  imports: [CountryModule, SkillModule]
})
export class ReferenceModule {}
