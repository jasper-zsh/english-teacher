import { Module } from '@nestjs/common';
import { DictionaryService } from './dictionary.service';
import { HttpModule } from '@nestjs/axios';
import { DictionaryController } from './dictionary.controller';
import { StudyListService } from './studylist.service';
import { StudyListController } from './studylist.controller';

@Module({
  imports: [HttpModule],
  controllers: [DictionaryController, StudyListController],
  providers: [DictionaryService, StudyListService],
})
export class DictionaryModule {}
