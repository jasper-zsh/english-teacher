import { PrismaService } from '@/prisma.service';
import { Injectable } from '@nestjs/common';
import { Conversation } from '@prisma/client';
import { CreateConversationDTO } from './dto/create_conversation.dto';
import { AIService } from '@/ai/ai.service';

@Injectable()
export class ConversationService {
  constructor(
    private prisma: PrismaService,
    private aiService: AIService,
  ) {}

  async listConversations(): Promise<Conversation[]> {
    return this.prisma.conversation.findMany();
  }

  async createConversation(dto: CreateConversationDTO): Promise<Conversation> {
    const thread = await this.aiService.createThread();
    const conversation = await this.prisma.conversation.create({
      data: {
        assistantId: dto.assistantId,
        threadId: thread.id,
      },
    });
    return conversation;
  }
}
