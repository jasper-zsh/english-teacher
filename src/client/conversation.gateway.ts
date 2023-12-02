import { AIInterface, Direction } from '@/ai/ai.interface';
import { TeacherChatbot } from '@/ai/teacher.chatbot';
import { WsExceptionFilter } from '@/exception.filter';
import { PrismaService } from '@/prisma.service';
import { GoogleVoiceService } from '@/voice/google.service';
import { Logger, UseFilters } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse,
} from '@nestjs/websockets';
import { Conversation, Message } from '@prisma/client';
import { randomUUID } from 'crypto';
import {
  EMPTY,
  Observable,
  expand,
  from,
  map,
  mergeMap,
  mergeWith,
  of,
} from 'rxjs';
import * as pumpify from 'pumpify';

export class ConversationContext {
  public readonly id: string;
  public readonly client: WebSocket;
  public conversation?: Conversation;
  public speechStream?: pumpify;
  public speechResults: string[] = [];

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
  private readonly logger = new Logger('Conversation');

  constructor(
    private prisma: PrismaService,
    private ai: AIInterface,
    private teacher: TeacherChatbot,
    private voice: GoogleVoiceService,
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
    @MessageBody('id') id: string,
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

  async send(client: any, event: string, data: any) {
    await client.send(
      JSON.stringify({
        event,
        data,
      }),
    );
  }

  @SubscribeMessage('load_messages')
  async loadMessages(
    @ConnectedSocket() client: any,
    @MessageBody('direction') direction: Direction,
    @MessageBody('cursor') cursor?: number,
  ): Promise<Observable<WsResponse<any>>> {
    const ctx = this.ctx.get(client);
    if (!ctx.conversation) {
      throw new Error('Conversation not loaded');
    }
    return from(
      this.ai.listMessages(
        ctx.conversation,
        direction,
        20,
        cursor ? new Date(cursor) : undefined,
      ),
    )
      .pipe(
        expand((p) =>
          p.hasMore
            ? this.ai.listMessages(
                ctx.conversation,
                direction,
                20,
                new Date(p.cursor),
              )
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
      )
      .pipe(
        mergeWith(
          of({
            event: 'message_loaded',
            data: null,
          }),
        ),
      );
  }

  @SubscribeMessage('chat_text')
  async chatText(
    @ConnectedSocket() client: any,
    @MessageBody('text') text: string,
  ): Promise<void> {
    const ctx = this.ctx.get(client);
    if (!ctx.conversation) {
      throw new Error('Conversation not loaded');
    }
    const msg = await this.prisma.message.create({
      data: {
        conversationId: ctx.conversation.id,
        role: 'user',
        text,
      },
    });
    await this.send(client, 'msg_forward', msg);
    const res = await this.ai.chatText(ctx.conversation, this.teacher, msg);
    await this.send(client, 'msg_forward', res);
    await this.onTTS(client, res);
  }

  @SubscribeMessage('tts')
  async onTTS(@ConnectedSocket() client: any, @MessageBody() data: Message) {
    this.mustWithContext(client);
    const voice = await this.voice.textToSpeech(data.text);
    await this.send(client, 'voice_response', {
      message: data,
      voice: voice.toString('base64'),
    });
  }

  @SubscribeMessage('speaking')
  onSpeaking(@ConnectedSocket() client: any) {
    const ctx = this.mustWithContext(client);
    this.logger.log('Started a Speech To Text stream.');
    ctx.speechStream = this.voice.streamingSpeechToText();
    ctx.speechStream.on('data', (c) => {
      const results = c.results.map((r) => r.alternatives[0].transcript);
      console.log(results);
      ctx.speechResults?.push(...results);
    });
    ctx.speechStream.on('end', () => {
      this.logger.log('Speech To Text stream ended.');
      this.chatText(client, ctx.speechResults.join(' '));
      ctx.speechResults = [];
      ctx.speechStream = undefined;
    });
  }

  @SubscribeMessage('audio_data')
  onAudioData(@ConnectedSocket() client: any, @MessageBody() data: string) {
    const ctx = this.mustWithContext(client);
    if (ctx.speechStream) {
      this.logger.log(`Got audio data in lenght ${data.length}`);
      ctx.speechStream.write(Buffer.from(data, 'base64'));
    }
  }

  @SubscribeMessage('speaking_end')
  async onSpeakingEnd(@ConnectedSocket() client: any) {
    const ctx = this.mustWithContext(client);
    if (ctx.speechStream) {
      ctx.speechStream.end();
      ctx.speechStream = undefined;
    }
  }

  mustWithContext(client: any): ConversationContext {
    const ctx = this.ctx.get(client);
    if (!ctx.conversation) {
      throw new Error('Conversation not loaded');
    }
    return ctx;
  }
}
