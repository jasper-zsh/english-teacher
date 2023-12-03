import { WordEntryDTO } from './word.dto';

export class CreateStudyListDTO {
  name: string;
}

export class AddWordToStudyListDTO {
  wordEntryId: string;
}

export class WordInStudyListDTO {
  word: string;
  createdAt: Date;
  updatedAt: Date;
  wordEntry?: WordEntryDTO;

  public static fromDB(db: any): WordInStudyListDTO {
    const dto = new WordInStudyListDTO();
    dto.word = db.word;
    dto.createdAt = db.createdAt;
    dto.updatedAt = db.updateAt;
    if (db.wordEntry) {
      dto.wordEntry = WordEntryDTO.newFromDB(db.wordEntry);
    }
    return dto;
  }
}

export class StudyListDTO {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  words?: WordEntryDTO[];

  public static fromDB(db: any): StudyListDTO {
    const dto = new StudyListDTO();
    dto.id = db.id;
    dto.name = db.name;
    dto.createdAt = db.createdAt;
    dto.updatedAt = db.updatedAt;
    if (db.words) {
      dto.words = db.words.map(WordInStudyListDTO.fromDB);
    }
    return dto;
  }
}
