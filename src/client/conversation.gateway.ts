import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway()
export class ConversationGateway {
  @SubscribeMessage('ping')
  ping(): string {
    return 'pong';
  }
}
