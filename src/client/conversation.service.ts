import { PrismaService } from '@/prisma.service';
import { Injectable } from '@nestjs/common';
import { Conversation } from '@prisma/client';
import { AIInterface } from '@/ai/ai.interface';

@Injectable()
export class ConversationService {
  constructor(
    private prisma: PrismaService,
    private ai: AIInterface,
  ) {}

  async listConversations(): Promise<Conversation[]> {
    return this.prisma.conversation.findMany();
  }

  async createConversation(assistantId: number): Promise<Conversation> {
    const assistant = await this.prisma.assistant.findFirstOrThrow({
      where: {
        id: assistantId,
      },
    });
    const conversation = await this.ai.createConversation(assistant);
    return conversation;
  }
}
