import speechToText from '@google-cloud/speech';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { google } from '@google-cloud/text-to-speech/build/protos/protos';
import { Translate } from '@google-cloud/translate/build/src/v2';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import { ComboDto, SpeechToTextDto, TextToSpeechDto } from './translation.dto';
import SsmlVoiceGender = google.cloud.texttospeech.v1.SsmlVoiceGender;
import AudioEncoding = google.cloud.texttospeech.v1.AudioEncoding;
import ISynthesizeSpeechRequest = google.cloud.texttospeech.v1.ISynthesizeSpeechRequest;
import * as fs from 'fs';
import * as util from 'util';

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

  // async textToSpeech({
  //   text,
  //   languageCode,
  //   ssmlGender,
  //   audioEncoding,
  // }: TextToSpeechDto): Promise<Readable> {
  //   const request: ISynthesizeSpeechRequest = {
  //     input: { text },
  //     voice: { languageCode, ssmlGender },
  //     audioConfig: { audioEncoding },
  //   };
  //   const [response] = await this.textToSpeechClient.synthesizeSpeech(request);
  //   return Readable.from(response.audioContent);
  // }

  async textToSpeech({
    text,
    languageCode,
    ssmlGender,
    audioEncoding,
  }: TextToSpeechDto): Promise<string | Uint8Array> {
    const request: ISynthesizeSpeechRequest = {
      input: { text },
      voice: { languageCode, ssmlGender },
      audioConfig: { audioEncoding },
    };
    const [response] = await this.textToSpeechClient.synthesizeSpeech(request);
    return response.audioContent;
  }

  async speechToText({ audio, languageCode }: SpeechToTextDto): Promise<string> {
    const request = {
      config: {
        sampleRate: 16000,
        encoding: "WAV",
        languageCode: languageCode,
      },
      audio: {
        content: audio
      },
    };

    const [operation] = await this.speechToTextClient.longRunningRecognize(request);

    const [response] = await operation.promise();
    const transcription = response.results
      .map((result) => result.alternatives[0].transcript)
      .join('\n');
    return transcription;
  }

  async combo({sourceAudio, sourceLanguageCode, roomCode, targetLanguageCode}: ComboDto): Promise<string> {
    const text = await this.speechToText({audio: sourceAudio, languageCode: sourceLanguageCode})
    const translatedText = await this.translateText(text, targetLanguageCode);
    const translatedVoice = await this.textToSpeech({text: translatedText,languageCode: targetLanguageCode, ssmlGender: SsmlVoiceGender.NEUTRAL, audioEncoding: AudioEncoding.MP3})
    const writeFile = util.promisify(fs.writeFile);
    await writeFile('output.mp3', translatedVoice, 'binary');
    return text
  }
}
