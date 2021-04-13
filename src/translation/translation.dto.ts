import { google } from '@google-cloud/text-to-speech/build/protos/protos';
import SsmlVoiceGender = google.cloud.texttospeech.v1.SsmlVoiceGender;
import AudioEncoding = google.cloud.texttospeech.v1.AudioEncoding;

export class TextToSpeechDto {
  text: string;
  languageCode: string;
  ssmlGender: SsmlVoiceGender;
  audioEncoding: AudioEncoding;
}

export class TranslateDto {
  text: string;
  target: string;
}
