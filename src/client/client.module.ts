import { Module } from '@nestjs/common';
import { ConversationGateway } from './conversation.gateway';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { AIModule } from '@/ai/ai.module';
import { TeacherController } from './teacher.controller';

@Module({
  imports: [AIModule],
  controllers: [ConversationController, TeacherController],
  providers: [ConversationGateway, ConversationService],
})
export class ClientModule {}
