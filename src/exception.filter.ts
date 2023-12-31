import { ArgumentsHost, Catch, Logger } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';

@Catch()
export class WsExceptionFilter extends BaseWsExceptionFilter {
  private readonly logger = new Logger('WebSocket');

  catch(exception: any, host: ArgumentsHost): void {
    const client = host.switchToWs().getClient() as WebSocket;
    client.send(JSON.stringify({ error: exception.message }));
    this.logger.error(exception);
  }
}
