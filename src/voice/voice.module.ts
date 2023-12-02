import { Module } from '@nestjs/common';
import { GoogleVoiceService } from './google.service';

@Module({
  providers: [GoogleVoiceService],
  exports: [GoogleVoiceService],
})
export class VoiceModule {}
