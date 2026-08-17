import { Module } from '@nestjs/common';
import { KafkaModule } from 'src/kafka/kafka.module';
import { CountryService } from './country.service';
import { CountryController } from './country.controller';

@Module({
  imports: [
    KafkaModule,
  ],
  providers: [CountryService],
  controllers: [CountryController]
})
export class CountryModule {}
