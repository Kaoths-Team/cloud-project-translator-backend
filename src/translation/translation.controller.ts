import { google } from '@google-cloud/text-to-speech/build/protos/protos';
import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { Readable } from 'node:stream';
import { ComboDto, SpeechToTextDto, TextToSpeechDto, TranslateDto } from './translation.dto';
import { TranslationService } from './translation.service';
import AudioEncoding = google.cloud.texttospeech.v1.AudioEncoding;
import SsmlVoiceGender = google.cloud.texttospeech.v1.SsmlVoiceGender;

@Controller('translation')
export class TranslationController {
  constructor(private readonly translationService: TranslationService) {}

  @Post('/speech-to-text')
  @HttpCode(200)
  async speechToText(@Body() dto: SpeechToTextDto) {
    const text = await this.translationService.speechToText(dto);
    return text;
  }

  // @Get('/text-to-speech')
  // @Header('Content-Type', 'audio/mpeg')
  // // @Header('Content-Disposition', 'attachment; filename="hello-world.mp3"')
  // async getTTS(
  //   @Res() response,
  //   @Query('text') text: string,
  //   @Query('lang') languageCode: string,
  //   @Query('gender') gender: string,
  // ) {
  //   const dto: TextToSpeechDto = {
  //     text,
  //     languageCode,
  //     audioEncoding: AudioEncoding.MP3,
  //     ssmlGender: SsmlVoiceGender[gender],
  //   };
  //   const readable = await this.translationService.textToSpeech(dto);
  //   return readable.pipe<Response>(response);
  // }

  @Post('/translate')
  async translate(@Body() dto: TranslateDto) {
    const response = await this.translationService.translateText(
      dto.text,
      dto.target,
    );
    return response;
  }

  @Post('/combo')
  @HttpCode(200)
  @Header('Content-Type', 'audio/mpeg')
  // @Header('Content-Disposition', 'attachment; filename="hello-world.mp3"')
  async combo(@Body() dto: ComboDto): Promise<void> {
    const text = await this.translationService.combo(dto);
    // return text;
  }
}
