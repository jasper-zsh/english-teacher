import { Controller, Get } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { Conversation } from '@prisma/client';

@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get()
  async listConversations(): Promise<Conversation[]> {
    return this.conversationService.listConversations();
  }
}
