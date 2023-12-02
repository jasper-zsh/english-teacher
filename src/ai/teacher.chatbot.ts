import { Injectable } from '@nestjs/common';
import { ChatbotInterface } from './chatbot.interface';
import { ContextMessage } from './dto/message.dto';
import { encode } from 'gpt-tokenizer';
import { PrismaService } from '@/prisma.service';
import { Conversation } from '@prisma/client';

@Injectable()
export class TeacherChatbot implements ChatbotInterface {
  contextLimit = 3000;

  constructor(private prisma: PrismaService) {}

  async buildContext(conversation: Conversation): Promise<ContextMessage[]> {
    let ret: ContextMessage[] = [];
    const prompt: ContextMessage[] = [
      {
        role: 'system',
        content: `Imagine you are an english teacher. I will tell you my requirement, and you should choose capable scenarios, and play a role, to make a conversation with me. Here're some rules you must obey:
You should talk with me round by round.
You must not generate more than one assistant response in a single message.
You must not generate texts for user role.
Avoid emojis. Only reply with words.
Only ask 1 question in a single reply, avoid asking continously`,
      },
      {
        role: 'user',
        content: 'I will go scuba diving in Phillipines next month.',
      },
      {
        role: 'assistant',
        content:
          'OK, I will act as a scuba diving trainer.\nWhen did you dive last time?',
      },
      {
        role: 'user',
        content:
          'The messages above are just examples, you should not use them to start our practise. Now forget the topic of them, and choose other scenarios randomly.',
      },
      {
        role: 'assistant',
        content: 'OK, got it. I will start in different scenes.',
      },
    ];
    let tokens = 0;
    let cursor: Date | undefined = undefined;
    tokens += prompt
      .map((m) => encode(m.content).length)
      .reduce((a, b) => a + b);
    let done = false;
    while (!done) {
      const msgs = await this.prisma.message.findMany({
        where: {
          conversationId: conversation.id,
          createdAt: cursor
            ? {
                lt: cursor,
              }
            : undefined,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      if (msgs.length === 0) {
        done = true;
        break;
      }
      for (const msg of msgs) {
        const cnt = encode(msg.text).length;
        if (tokens + cnt > this.contextLimit) {
          done = true;
          break;
        }
        ret.unshift({
          // @ts-expect-error string to enum
          role: msg.role,
          content: msg.text,
        });
        tokens += cnt;
        cursor = msg.createdAt;
      }
    }
    ret = prompt.concat(ret);
    return ret;
  }
}
