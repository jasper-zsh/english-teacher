import {
  Controller,
  Get,
  NotFoundException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DictionaryService } from './dictionary.service';
import { AuthenticatedGuard } from '@/auth/authenticated.guard';

@Controller('dictionary')
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
}
