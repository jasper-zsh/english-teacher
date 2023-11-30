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
} from '@nestjs/websockets';
import { Conversation } from '@prisma/client';
import { randomUUID } from 'crypto';

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

  constructor(private prisma: PrismaService) {}

  handleConnection(client: WebSocket) {
    const ctx = new ConversationContext(client);
    this.ctx.set(client, ctx);
  }

  handleDisconnect(client: WebSocket) {
    this.ctx.delete(client);
  }

  @SubscribeMessage('ping')
  ping(client: any): string {
    const ctx = this.ctx.get(client);
    console.log(ctx.id);
    return 'pong';
  }

  @SubscribeMessage('startConversation')
  async startConversation(
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
}
