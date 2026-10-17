import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation';
import { CountryModule } from './country/country.module';
import { SkillModule } from './skill/skill.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    PrismaModule,
    CountryModule,
    SkillModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
