import { Injectable } from '@nestjs/common';
import { TranslationServiceClient } from '@google-cloud/translate';
import { Translate } from '@google-cloud/translate/build/src/v2';
import speechToText, { SpeechClient } from "@google-cloud/speech";
import textToSpeech, { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { ConfigService } from '@nestjs/config';
import { TextToSpeechDto } from './translation.dto';
import { Readable } from 'stream';

// Text-to-Speech interfaces
import { google as GoogleTTS } from '@google-cloud/text-to-speech/build/protos/protos';
import SsmlVoiceGender = GoogleTTS.cloud.texttospeech.v1.SsmlVoiceGender;
import TTSAudioEncoding = GoogleTTS.cloud.texttospeech.v1.AudioEncoding;
import ISynthesizeSpeechRequest = GoogleTTS.cloud.texttospeech.v1.ISynthesizeSpeechRequest;

// Speech-to-Text interfaces
import { google as GoogleSTT } from "@google-cloud/speech/build/protos/protos";
import IRecognizeRequest = GoogleSTT.cloud.speech.v1.IRecognizeRequest;
import IRecognitionAudio = GoogleSTT.cloud.speech.v1.IRecognitionAudio;
import IRecognitionConfig = GoogleSTT.cloud.speech.v1.IRecognitionConfig;
import STTAudioEncoding =  GoogleSTT.cloud.speech.v1.RecognitionConfig.AudioEncoding

@Injectable()
export class TranslationService {
  private readonly speechToTextClient: SpeechClient;
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

  async speechToText(file: Express.Multer.File): Promise<any> {
    const audio: IRecognitionAudio = {
      content: Uint8Array.from(file.buffer),
    };
    const config: IRecognitionConfig = {
      encoding: STTAudioEncoding.LINEAR16,
      sampleRateHertz: 16000,
      languageCode: 'en-US',
      audioChannelCount: 2
    };
    const request: IRecognizeRequest = {
      audio: audio,
      config: config,
    };
    const [{ results } , , ] = await this.speechToTextClient.recognize(request)
    const allAlternatives = []
    for (const result of results) {
      allAlternatives.push(...result.alternatives)
    }
    allAlternatives.sort((a,b) => b.confidence - a.confidence)
    return allAlternatives
  }
}
