import { Page } from '@/common/dto/page.dto';
import { AIInterface, Direction } from './ai.interface';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { Conversation, Message } from '@prisma/client';
import OpenAI from 'openai';
import Config from '@/config';
import { ChatbotInterface } from './chatbot.interface';

@Injectable()
export class LlamaService extends AIInterface {
  private client: OpenAI;

  constructor(private prisma: PrismaService) {
    super();
    this.client = new OpenAI({
      apiKey: Config.LLAMA_API_TOKEN,
      baseURL: 'https://api.llama-api.com',
    });
  }

  providerName(): string {
    return 'llama';
  }

  async chatText(
    conversation: Conversation,
    bot: ChatbotInterface,
    message: Message,
  ): Promise<Message> {
    const res = await this.client.chat.completions.create({
      model: 'llama-70b-chat',
      messages: [
        ...(await bot.buildContext(conversation)),
        {
          role: 'user',
          content: message.text,
        },
      ],
    });
    return await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: res.choices[0].message.role,
        text: res.choices[0].message.content,
      },
    });
  }
  async listMessages(
    conversation: Conversation,
    direction: Direction,
    limit: number,
    cursor?: Date,
  ): Promise<Page<Message>> {
    const msgs = await this.prisma.message.findMany({
      where: {
        conversationId: conversation.id,
        createdAt: cursor
          ? {
              gt: direction === Direction.FORWARD ? cursor : undefined,
              lt: direction === Direction.BACKWARD ? cursor : undefined,
            }
          : undefined,
      },
      orderBy: [
        {
          createdAt: direction === Direction.FORWARD ? 'asc' : 'desc',
        },
      ],
      take: limit,
    });
    const r = new Page<Message>();
    r.data = msgs;
    r.hasMore = false;
    if (msgs.length === 0) {
      return r;
    }
    if (direction === Direction.FORWARD) {
      const last = await this.prisma.message.findFirst({
        where: {
          conversationId: conversation.id,
        },
        orderBy: [
          {
            createdAt: 'asc',
          },
        ],
      });
      if (msgs[msgs.length - 1].id != last.id) {
        r.hasMore = true;
        r.cursor = msgs[msgs.length - 1].createdAt.toISOString();
      }
    } else {
      const first = await this.prisma.message.findFirst({
        where: {
          conversationId: conversation.id,
        },
        orderBy: [
          {
            createdAt: 'desc',
          },
        ],
      });
      if (msgs[msgs.length - 1].id !== first.id) {
        r.hasMore = true;
        r.cursor = msgs[msgs.length - 1].createdAt.toISOString();
      }
    }
    return r;
  }
}
