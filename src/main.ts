import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WsAdapter } from '@nestjs/platform-ws';
import Config from './config';
import { LogInterceptor } from './log.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new WsAdapter(app));
  app.enableCors({
    credentials: true,
    origin: Config.FE_BASE_URL,
  });
  app.useGlobalInterceptors(new LogInterceptor());

  await app.listen(3000);
}
bootstrap();
