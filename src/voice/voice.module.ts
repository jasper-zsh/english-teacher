import { Module } from '@nestjs/common';
import { GoogleVoiceService } from './google.service';
import {
  SpeechToTextInterface,
  TextToSpeechInterface,
} from './voice.interface';
import { OpenAIVoiceService } from './openai.service';

@Module({
  providers: [
    {
      provide: TextToSpeechInterface,
      useClass: OpenAIVoiceService,
    },
    {
      provide: SpeechToTextInterface,
      useClass: OpenAIVoiceService,
    },
  ],
  exports: [TextToSpeechInterface, SpeechToTextInterface],
})
export class VoiceModule {}
