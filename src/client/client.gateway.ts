import { SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";

@WebSocketGateway()
export class ClientGateway {
    @SubscribeMessage('ping')
    ping(): string {
        return 'pong'
    }
}