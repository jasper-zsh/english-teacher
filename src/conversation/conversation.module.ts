import { Module } from '@nestjs/common';
import { ConversationGateway } from './conversation.gateway';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { AIModule } from '@/ai/ai.module';
import { VoiceModule } from '@/voice/voice.module';

@Module({
  imports: [AIModule, VoiceModule],
  controllers: [ConversationController],
  providers: [ConversationGateway, ConversationService],
})
export class ConversationModule {}
