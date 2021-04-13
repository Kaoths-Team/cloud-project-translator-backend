import { Module } from '@nestjs/common';
import { TranslationController } from './translation.controller';
import { TranslationService } from './translation.service';
import { TranslationGateway } from "./translation.gateway";

@Module({
  controllers: [TranslationController],
  providers: [TranslationGateway, TranslationService],
  exports: [TranslationService]
})
export class TranslationModule {}
