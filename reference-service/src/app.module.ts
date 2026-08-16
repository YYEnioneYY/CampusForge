import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation';
import { CountryModule } from './country/country.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    PrismaModule,
    CountryModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
