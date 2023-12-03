import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DictionaryService } from './dictionary.service';
import { AuthenticatedGuard } from '@/auth/authenticated.guard';

@Controller('dictionaries')
@UseGuards(AuthenticatedGuard)
export class DictionaryController {
  constructor(private dictionary: DictionaryService) {}

  @Get('word')
  async getWord(@Query('word') word: string) {
    const res = await this.dictionary.getWord(word);
    if (!res) {
      throw new NotFoundException('Word not found');
    }
    return res;
  }

  @Get('words/:id')
  async getWordEntry(@Param('id') id: string) {
    const res = await this.dictionary.getWordEntry(id);
    if (!res) {
      throw new NotFoundException('WordEntry not found');
    }
    return res;
  }
}
