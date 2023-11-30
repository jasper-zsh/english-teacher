import { PrismaService } from '@/prisma.service';
import { Injectable } from '@nestjs/common';
import { Conversation } from '@prisma/client';

@Injectable()
export class ConversationService {
  constructor(private prisma: PrismaService) {}

  async listConversations(): Promise<Conversation[]> {
    return this.prisma.conversation.findMany();
  }
}
