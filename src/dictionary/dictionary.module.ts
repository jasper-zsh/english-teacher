import { Module } from '@nestjs/common';
import { DictionaryService } from './dictionary.service';
import { HttpModule } from '@nestjs/axios';
import { DictionaryController } from './dictionary.controller';

@Module({
  imports: [HttpModule],
  controllers: [DictionaryController],
  providers: [DictionaryService],
})
export class DictionaryModule {}
