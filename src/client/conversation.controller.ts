import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { Conversation } from '@prisma/client';
import { AuthenticatedGuard } from '@/auth/authenticated.guard';

@UseGuards(AuthenticatedGuard)
@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get()
  async listConversations(@Request() req): Promise<Conversation[]> {
    return await this.conversationService.listConversations(req.user);
  }

  @Post()
  async createConversation(@Request() req): Promise<Conversation> {
    return await this.conversationService.createConversation(req.user);
  }

  @Delete(':id')
  async deleteConversation(@Request() req, @Param('id') id: string) {
    await this.conversationService.deleteConversation(req.user, id);
    return {};
  }
}
