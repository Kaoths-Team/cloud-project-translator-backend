import { Injectable } from '@nestjs/common';
import { Translate } from '@google-cloud/translate/build/src/v2';
import speechToText, { SpeechClient } from '@google-cloud/speech';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';

// Text-to-Speech interfaces
import { google as GoogleTTS } from '@google-cloud/text-to-speech/build/protos/protos';
import SsmlVoiceGender = GoogleTTS.cloud.texttospeech.v1.SsmlVoiceGender;
import TTSAudioEncoding = GoogleTTS.cloud.texttospeech.v1.AudioEncoding;
import ISynthesizeSpeechRequest = GoogleTTS.cloud.texttospeech.v1.ISynthesizeSpeechRequest;

// Speech-to-Text interfaces
import { google as GoogleSTT } from '@google-cloud/speech/build/protos/protos';
import IRecognizeRequest = GoogleSTT.cloud.speech.v1.IRecognizeRequest;
import IRecognitionAudio = GoogleSTT.cloud.speech.v1.IRecognitionAudio;
import IRecognitionConfig = GoogleSTT.cloud.speech.v1.IRecognitionConfig;
import STTAudioEncoding = GoogleSTT.cloud.speech.v1.RecognitionConfig.AudioEncoding;
import ISpeechRecognitionAlternative = GoogleSTT.cloud.speech.v1.ISpeechRecognitionAlternative;

@Injectable()
export class TranslationService {
  private readonly speechToTextClient: SpeechClient;
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

  async translateText(text: string, to: string): Promise<string> {
    const [translation] = await this.translationClient.translate(text, to);
    return translation;
  }

  async textToSpeech(
    text: string,
    languageCode: string,
    ssmlGender: SsmlVoiceGender = SsmlVoiceGender.NEUTRAL,
    audioEncoding: TTSAudioEncoding = TTSAudioEncoding.LINEAR16,
  ): Promise<[string | Uint8Array, Readable]> {
    const request: ISynthesizeSpeechRequest = {
      input: {
        text,
      },
      voice: {
        languageCode,
        ssmlGender,
      },
      audioConfig: {
        audioEncoding,
      },
    };
    const [response] = await this.textToSpeechClient.synthesizeSpeech(request);
    return [response.audioContent, Readable.from(response.audioContent)];
  }

  async speechToText(
    inputAudio: any,
    languageCode: string,
  ): Promise<ISpeechRecognitionAlternative[]> {
    const audio: IRecognitionAudio = {
      content: Uint8Array.from(inputAudio.buffer),
    };
    const config: IRecognitionConfig = {
      encoding: STTAudioEncoding.LINEAR16,
      sampleRateHertz: 16000,
      languageCode,
      audioChannelCount: 2,
    };
    const request: IRecognizeRequest = {
      audio: audio,
      config: config,
    };
    const [{ results }, ,] = await this.speechToTextClient.recognize(request);
    const allAlternatives: Partial<ISpeechRecognitionAlternative>[] = [];
    for (const result of results) {
      allAlternatives.push(...result.alternatives);
    }
    allAlternatives.sort((a, b) => b.confidence - a.confidence);
    return allAlternatives;
  }

  async speechToSpeech(
    audio: any,
    from: string,
    to: string,
    ssmlGender: SsmlVoiceGender = SsmlVoiceGender.NEUTRAL,
  ): Promise<[string | Uint8Array, Readable]> {
    const alternatives = await this.speechToText(audio, from);
    const inputText = alternatives[0].transcript;
    const translatedText = await this.translateText(inputText, to);
    return this.textToSpeech(translatedText, to, ssmlGender);
  }
}
