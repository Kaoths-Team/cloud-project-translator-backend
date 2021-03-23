import { Injectable } from '@nestjs/common';
import { TranslationServiceClient } from "@google-cloud/translate";
import { Translate } from "@google-cloud/translate/build/src/v2";
import speechToText from '@google-cloud/speech'
import textToSpeech from '@google-cloud/text-to-speech'
import { ConfigService } from "@nestjs/config";

@Injectable()
export class TranslationService {
  private readonly speechToTextClient
  private readonly textToSpeechClient
  private readonly translationClient

  constructor(private readonly configService: ConfigService) {
    this.textToSpeechClient = new textToSpeech.TextToSpeechClient()
    this.speechToTextClient = new speechToText.SpeechClient()
    this.translationClient = new Translate({
      projectId: this.configService.get<string>("gcp.projectId")
    })
  }
}
