import { Module } from '@nestjs/common';
import { AIInterface } from './ai.interface';
import { LlamaService } from './llama.service';
import { TeacherChatbot } from './teacher.chatbot';

@Module({
  providers: [
    {
      provide: AIInterface,
      useClass: LlamaService,
    },
    TeacherChatbot,
  ],
  exports: [AIInterface, TeacherChatbot],
})
export class AIModule {}
