import { PrismaService } from '@/prisma.service';
import { Injectable } from '@nestjs/common';
import { WordDefinitionDTO, WordEntryDTO } from './dto/word.dto';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class DictionaryService {
  constructor(
    private prisma: PrismaService,
    private http: HttpService,
  ) {}

  async getWordEntry(id: string): Promise<WordEntryDTO> {
    const entry = await this.prisma.wordEntry.findFirst({
      where: {
        id,
      },
    });
    if (!entry) {
      return null;
    }
    return WordEntryDTO.newFromDB(entry);
  }

  async getWord(word: string): Promise<WordEntryDTO> {
    const entry = await this.prisma.wordEntry.findFirst({
      where: {
        source: 'iciba',
        word,
      },
    });
    if (entry) {
      return WordEntryDTO.newFromDB(entry);
    }
    const res = await this.http.axiosRef.get(
      'https://dict-mobile.iciba.com/interface/index.php',
      {
        params: {
          c: 'word',
          m: 'getsuggest',
          is_need_mean: 1,
          word,
        },
      },
    );
    if (res.data.message.length > 0) {
      const definitions: WordDefinitionDTO[] = [];
      for (const def of res.data.message[0].means) {
        const dto = new WordDefinitionDTO();
        dto.part = def.part;
        dto.definitions = def.means;
        definitions.push(dto);
      }
      const entry = await this.prisma.wordEntry.create({
        data: {
          source: 'iciba',
          word,
          definitions: JSON.stringify(definitions),
        },
      });
      return WordEntryDTO.newFromDB(entry);
    }
    return null;
  }
}
