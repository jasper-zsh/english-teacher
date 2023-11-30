import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import config from '@/config';
import { RunDTO } from './dto/run.dto';
import { Assistant as RemoteAssistant } from 'openai/resources/beta/assistants/assistants';
import { Thread } from 'openai/resources/beta/threads/threads';
import { Run } from 'openai/resources/beta/threads/runs/runs';
import { ThreadMessage } from 'openai/resources/beta/threads/messages/messages';
import { Page } from '@/common/dto/page.dto';
import Config from '@/config';
import { AIInterface, Direction } from './ai.interface';
import { newAssistantFromAPI, newMessageFromAPI } from './openai.helper';
import { Assistant, Conversation } from '@prisma/client';
import { PrismaService } from '@/prisma.service';
import { MessageDTO } from './dto/message.dto';
import { CreateAssistantDTO } from './dto/assistant.dto';

@Injectable()
export class OpenAIService extends AIInterface {
  createAssistant(dto: CreateAssistantDTO): Promise<{ id: number; provider: string; name: string; prompt: string; metadata: string; }> {
    throw new Error('Method not implemented.');
  }
  private readonly openai: OpenAI;

  constructor(private prisma: PrismaService) {
    super()
    this.openai = new OpenAI({
      apiKey: Config.OPENAI_API_KEY,
    });
  }

  providerName(): string {
    return "openai"
  }

  async listAssistants(): Promise<Assistant[]> {
    const res = await this.openai.beta.assistants.list();
    const remote = new Map<string, RemoteAssistant>();
    for (let a of res.data) {
      remote.set(a.id, a)
    }
    const persisted = await this.prisma.assistant.findMany({
      where: {
        provider: {
          equals: this.providerName(),
        }
      }
    });
    const local = new Map<string, Assistant>();
    for (let a of persisted) {
      const meta = JSON.parse(a.metadata)
      local.set(meta.assistant_id, a)
    }
    const r = new Array<Assistant>()
    for (let e of local.entries()) {
      if (!remote.has(e[0])) {
        await this.prisma.assistant.delete({
          where: {
            id: e[1].id,
          }
        })
        local.delete(e[0])
      } else {
        r.push(e[1])
      }
    }
    for (let e of remote.entries()) {
      if (!local.has(e[0])) {
        const a = await this.prisma.assistant.create({
          data: {
            provider: this.providerName(),
            name: e[1].name,
            prompt: e[1].instructions,
            metadata: JSON.stringify({
              assistant_id: e[1].id,
            }),
          }
        });
        r.push(a);
      }
    }
    return r;
  }

  async createConversation(assistant: Assistant): Promise<Conversation> {
    const thread = await this.openai.beta.threads.create();
    const conv = await this.prisma.conversation.create({
      data: {
        provider: this.providerName(),
        assistantId: assistant.id,
        metadata: JSON.stringify({
          thread_id: thread.id,
        })
      }
    });
    return conv;
  }

  async addTextMessageAndRun(conversation: Conversation, message: string): Promise<void> {
    const cMeta = JSON.parse(conversation.metadata);
    const assistant = await this.prisma.assistant.findFirstOrThrow({
      where: {
        id: conversation.assistantId,
      },
    });
    const aMeta = JSON.parse(conversation.metadata);
    await this.openai.beta.threads.messages.create(cMeta.thread_id, {
      role: 'user',
      content: message,
    });
    const run = await this.openai.beta.threads.runs.create(cMeta.thread_id, {
      assistant_id: aMeta.assistant_id,
    });
    await this.waitForResponse(run);
  }

  async listMessages(conversation: Conversation, direction: Direction, limit: number, cursor?: string): Promise<Page<MessageDTO>> {
    const cMeta = JSON.parse(conversation.metadata);
    const res = await this.openai.beta.threads.messages.list(cMeta.thread_id, {
      order: direction === Direction.FORWARD ? 'asc' : 'desc',
      after: direction === Direction.FORWARD ? cursor : undefined,
      before: direction === Direction.FORWARD ? undefined : cursor,
      limit: limit,
    });
    const page = new Page<MessageDTO>();
    page.hasMore = res.hasNextPage();
    page.data = res.data.map(newMessageFromAPI)
    if (res.data.length > 0) {
      page.cursor = direction === Direction.FORWARD ? res.data[res.data.length - 1].id : res.data[0].id;
    }
    return page;
  }

  async listMessageAfter(threadId: string, lastMessageId?: string): Promise<Page<ThreadMessage>> {
    const res = await this.openai.beta.threads.messages.list(threadId, {
      after: lastMessageId,
    })
    const page = new Page<ThreadMessage>();
    page.data = res.data;
    page.hasMore = res.hasNextPage();
    page.cursor = res.data.length > 0 ? res.data[res.data.length - 1].id : null
    return page;
  }

  async listMessageBefore(threadId: string, firstMessageId?: string): Promise<Page<ThreadMessage>> {
    const res = await this.openai.beta.threads.messages.list(threadId, {
      before: firstMessageId,
    });
    const page = new Page<ThreadMessage>();
    page.data = res.data;
    page.hasMore = res.hasNextPage();
    page.cursor = res.data.length > 0 ? res.data[0].id : null
    return page;
  }

  async waitForResponse(run: Run): Promise<void> {
    for (;;) {
      const res = await this.openai.beta.threads.runs.retrieve(run.thread_id, run.id)
      if (['queued', 'in_progress', 'cancelling'].indexOf(res.status) < 0) {
        continue
      }
      switch (res.status) {
        case 'completed':
          return;
        case 'failed':
          throw new Error(res.last_error.message)
        default:
          throw new Error(`Unhandled run status: ${res.status}`)
      }
    }
  }
}
