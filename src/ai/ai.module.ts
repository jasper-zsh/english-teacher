import { Module } from '@nestjs/common';
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
