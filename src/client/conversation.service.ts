import { PrismaService } from '@/prisma.service';
import { Injectable } from '@nestjs/common';
import { Conversation, User } from '@prisma/client';
import { AIInterface } from '@/ai/ai.interface';

@Injectable()
export class ConversationService {
  constructor(
    private prisma: PrismaService,
    private ai: AIInterface,
  ) {}

  async listConversations(user: User): Promise<Conversation[]> {
    return this.prisma.conversation.findMany({
      where: {
        userId: user.id,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });
  }

  async createConversation(user: User): Promise<Conversation> {
    const conversation = await this.prisma.conversation.create({
      data: {
        userId: user.id,
      },
    });
    return conversation;
  }

  async deleteConversation(user: User, id: string) {
    await this.prisma.conversation.update({
      where: {
        userId: user.id,
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
