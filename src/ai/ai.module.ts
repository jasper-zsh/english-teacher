import { Module } from '@nestjs/common';
import { OpenAIService } from './openai.service';
import { AIInterface } from './ai.interface';
import { LlamaService } from './llama.service';

@Module({
  providers: [{
    provide: AIInterface,
    useClass: LlamaService,
  }],
  exports: [AIInterface],
})
export class AIModule {}
