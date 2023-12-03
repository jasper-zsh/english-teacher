import { WordEntry } from '@prisma/client';

export class WordDefinitionDTO {
  part: string;
  definitions: string[];

  public static newFromJsonObject(obj: any): WordDefinitionDTO {
    const dto = new WordDefinitionDTO();
    dto.part = obj.part;
    dto.definitions = obj.definitions;
    return dto;
  }
}

export class WordEntryDTO {
  id: string;
  word: string;
  definitions: WordDefinitionDTO[];
  createdAt: Date;
  updatedAt: Date;

  public static newFromDB(db: WordEntry): WordEntryDTO {
    const dto = new WordEntryDTO();
    dto.id = db.id;
    dto.word = db.word;
    const rawDefinitions = JSON.parse(db.definitions);
    dto.definitions = [];
    for (const o of rawDefinitions) {
      dto.definitions.push(WordDefinitionDTO.newFromJsonObject(o));
    }
    return dto;
  }
}
