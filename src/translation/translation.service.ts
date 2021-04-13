import speechToText from '@google-cloud/speech';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { google } from '@google-cloud/text-to-speech/build/protos/protos';
import { Translate } from '@google-cloud/translate/build/src/v2';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import { TextToSpeechDto } from './translation.dto';
import SsmlVoiceGender = google.cloud.texttospeech.v1.SsmlVoiceGender;
import AudioEncoding = google.cloud.texttospeech.v1.AudioEncoding;
import ISynthesizeSpeechRequest = google.cloud.texttospeech.v1.ISynthesizeSpeechRequest;

@Injectable()
export class TranslationService {
  private readonly speechToTextClient;
  private readonly textToSpeechClient: TextToSpeechClient;
  private readonly translationClient: Translate;

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
    this.translationClient = new Translate(googleAuthOptions);
  }

  async translateText(text: string, target: string) {
    const [translation] = await this.translationClient.translate(text, target);
    return translation;
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
