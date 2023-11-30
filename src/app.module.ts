import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ClientModule } from './client/client.module';
import { PrismaService } from './prisma.service';
import { AdminModule } from './admin/admin.module';

@Global()
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ClientModule, AdminModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
