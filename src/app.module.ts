import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TranslationModule } from './translation/translation.module';
import { ConfigModule } from "@nestjs/config";
import configuration from "./config/configuration";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      ignoreEnvFile: process.env.NODE_ENV !== 'production'
    }),
    TranslationModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}