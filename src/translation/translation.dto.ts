import { google } from '@google-cloud/text-to-speech/build/protos/protos';
import SsmlVoiceGender = google.cloud.texttospeech.v1.SsmlVoiceGender;

export type TextToSpeechDto = {
  text: string;
  languageCode: string;
  ssmlGender: SsmlVoiceGender;
};

export type SpeechToTextDto = {
  audio: any;
  languageCode: string;
};

export type SpeechToSpeechDto = {
  audio: any;
  from: string;
  to: string;
  ssmlGender?: SsmlVoiceGender;
};

export type UserJoinedDto = {
  id: string;
  languageCode: string;
  roomCode: string;
};

export type UserLeftDto = {
  id: string;
  roomCode: string;
};

export type CreateRoomDto = {
  roomCode: string;
  languageCode: string;
};

export type JoinRoomDto = CreateRoomDto;
