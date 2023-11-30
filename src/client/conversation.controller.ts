import { Body, Controller, Get, Post } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { Conversation } from '@prisma/client';
import { CreateConversationDTO } from './dto/create_conversation.dto';

@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get()
  async listConversations(): Promise<Conversation[]> {
    return this.conversationService.listConversations();
  }

  @Post()
  async createConversation(
    @Body() dto: CreateConversationDTO,
  ): Promise<Conversation> {
    return this.conversationService.createConversation(dto);
  }
}
