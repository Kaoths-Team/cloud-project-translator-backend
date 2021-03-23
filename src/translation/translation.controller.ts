import { Body, Controller, Header, HttpCode, Post, Res } from '@nestjs/common';
import { TranslationService } from './translation.service';
import { TextToSpeechDto } from './translation.dto';

@Controller('translation')
export class TranslationController {
  constructor(private readonly translationService: TranslationService) {}

  @Post('/text-to-speech')
  @HttpCode(200)
  @Header('Content-Type', 'audio/mpeg')
  // @Header('Content-Disposition', 'attachment; filename="hello-world.mp3"')
  async testTTS(@Res() response, @Body() dto: TextToSpeechDto) {
    const readable = await this.translationService.textToSpeech(dto);
    return readable.pipe(response);
  }
}
