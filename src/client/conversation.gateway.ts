import { AIInterface, Direction } from '@/ai/ai.interface';
import { MessageDTO } from '@/ai/dto/message.dto';
import { Page } from '@/common/dto/page.dto';
import { WsExceptionFilter } from '@/exception.filter';
import { PrismaService } from '@/prisma.service';
import { UseFilters } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WsException,
  WsResponse,
} from '@nestjs/websockets';
import { Conversation } from '@prisma/client';
import { randomUUID } from 'crypto';
import { ThreadMessage } from 'openai/resources/beta/threads/messages/messages';
import { EMPTY, Observable, empty, expand, flatMap, from, map, mergeMap } from 'rxjs';

export class ConversationContext {
  public readonly id: string;
  public readonly client: WebSocket;
  public conversation?: Conversation;

  constructor(client: WebSocket) {
    this.id = randomUUID();
    this.client = client;
  }
}

@WebSocketGateway()
@UseFilters(WsExceptionFilter)
export class ConversationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private ctx: Map<WebSocket, ConversationContext> = new Map();

  constructor(
    private prisma: PrismaService,
    private ai: AIInterface
  ) {}

  handleConnection(client: WebSocket) {
    const ctx = new ConversationContext(client);
    this.ctx.set(client, ctx);
  }

  handleDisconnect(client: WebSocket) {
    this.ctx.delete(client);
  }

  @SubscribeMessage('start')
  async start(
    @ConnectedSocket() client: any,
    @MessageBody('id') id: number,
  ) {
    const ctx = this.ctx.get(client);
    if (ctx.conversation) {
      throw new Error('Conversation already started');
    }
    ctx.conversation = await this.prisma.conversation.findFirst({
      where: {
        id,
      },
    });
    if (!ctx.conversation) {
      throw new Error('Conversation not found');
    }
    return ctx.conversation;
  }

  @SubscribeMessage('chatText')
  async chatText(
    @ConnectedSocket() client: any,
    @MessageBody('text') text: string,
    @MessageBody('cursor') cursor?: string
  ): Promise<Observable<WsResponse<MessageDTO>>> {
    const ctx = this.ctx.get(client);
    if (!ctx.conversation) {
      throw new Error('Conversation not loaded');
    }
    await this.ai.addTextMessageAndRun(ctx.conversation, text)
    return from(this.ai.listMessages(ctx.conversation, Direction.FORWARD, 20, cursor))
      .pipe(expand(p => p.hasMore ? this.ai.listMessages(ctx.conversation, Direction.FORWARD, 20, p.cursor) : EMPTY))
      .pipe(mergeMap(p => p.data))
      .pipe(map(p => ({
        event: 'msg_forward',
        data: p
      })))
  }
}
