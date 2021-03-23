import { Injectable } from '@nestjs/common';
import { TranslationServiceClient } from '@google-cloud/translate';
import { Translate } from '@google-cloud/translate/build/src/v2';
import speechToText from '@google-cloud/speech';
import textToSpeech, { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import { google } from '@google-cloud/text-to-speech/build/protos/protos';
import SsmlVoiceGender = google.cloud.texttospeech.v1.SsmlVoiceGender;
import AudioEncoding = google.cloud.texttospeech.v1.AudioEncoding;
import ISynthesizeSpeechRequest = google.cloud.texttospeech.v1.ISynthesizeSpeechRequest;
import { TextToSpeechDto } from './translation.dto';

@Injectable()
export class TranslationService {
  private readonly speechToTextClient;
  private readonly textToSpeechClient: TextToSpeechClient;
  private readonly translationClient;

  constructor(private readonly configService: ConfigService) {
    const googleAuthOptions = {
      projectId: this.configService.get('gcloud.projectId'),
      credentials: {
        client_email: this.configService.get('gcloud.clientEmail'),
        private_key: this.configService.get('gcloud.privateKey'),
      },
    };
    this.textToSpeechClient = new TextToSpeechClient(googleAuthOptions);
    this.speechToTextClient = new speechToText.SpeechClient(googleAuthOptions);
    this.translationClient = new Translate({
      projectId: this.configService.get<string>('gcloud.projectId'),
    });
  }

  async textToSpeech({
    text,
    languageCode,
    ssmlGender,
    audioEncoding,
  }: TextToSpeechDto): Promise<Readable> {
    const request: ISynthesizeSpeechRequest = {
      input: { text },
      voice: { languageCode, ssmlGender },
      audioConfig: { audioEncoding },
    };
    const [response] = await this.textToSpeechClient.synthesizeSpeech(request);
    return Readable.from(response.audioContent);
  }
}
