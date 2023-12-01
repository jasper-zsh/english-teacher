import { AIInterface, Direction } from '@/ai/ai.interface';
import { MessageDTO } from '@/ai/dto/message.dto';
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
  WsResponse,
} from '@nestjs/websockets';
import { Conversation } from '@prisma/client';
import { randomUUID } from 'crypto';
import { EMPTY, Observable, expand, from, map, mergeMap } from 'rxjs';

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
    private ai: AIInterface,
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
  ): Promise<WsResponse<Conversation>> {
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
    return {
      event: 'started',
      data: ctx.conversation,
    };
  }

  @SubscribeMessage('loadMessages')
  async loadMessages(
    @ConnectedSocket() client: any,
    @MessageBody('direction') direction: Direction,
    @MessageBody('cursor') cursor?: string,
  ): Promise<Observable<WsResponse<MessageDTO>>> {
    const ctx = this.ctx.get(client);
    if (!ctx.conversation) {
      throw new Error('Conversation not loaded');
    }
    return from(this.ai.listMessages(ctx.conversation, direction, 20, cursor))
      .pipe(
        expand((p) =>
          p.hasMore
            ? this.ai.listMessages(ctx.conversation, direction, 20, p.cursor)
            : EMPTY,
        ),
      )
      .pipe(mergeMap((p) => p.data))
      .pipe(
        map((p) => ({
          event:
            direction === Direction.FORWARD ? 'msg_forward' : 'msg_backward',
          data: p,
        })),
      );
  }

  @SubscribeMessage('chatText')
  async chatText(
    @ConnectedSocket() client: any,
    @MessageBody('text') text: string,
  ): Promise<Observable<WsResponse<MessageDTO>>> {
    const ctx = this.ctx.get(client);
    if (!ctx.conversation) {
      throw new Error('Conversation not loaded');
    }
    return (await this.ai.addTextMessageAndRun(ctx.conversation, text)).pipe(
      map((p) => ({
        event: 'msg_forward',
        data: p,
      })),
    );
  }
}
