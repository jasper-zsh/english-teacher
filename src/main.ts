import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WsAdapter } from '@nestjs/platform-ws';
import Config from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new WsAdapter(app));
  app.enableCors({
    credentials: true,
    origin: Config.FE_BASE_URL,
  });

  await app.listen(3000);
}
bootstrap();
