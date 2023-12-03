import { PrismaService } from '@/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { StudyList, User, WordInStudyList } from '@prisma/client';
import { AddWordToStudyListDTO, CreateStudyListDTO } from './dto/studylist.dto';
import { Page } from '@/common/dto/page.dto';

@Injectable()
export class StudyListService {
  constructor(private prisma: PrismaService) {}

  async createStudyList(
    dto: CreateStudyListDTO,
    user?: User,
  ): Promise<StudyList> {
    return await this.prisma.studyList.create({
      data: {
        userId: user?.id,
        name: dto.name,
      },
    });
  }

  async getStudyList(id: string, wordLimit?: number): Promise<StudyList> {
    return await this.prisma.studyList.findFirst({
      where: {
        id,
      },
      include: {
        words: {
          orderBy: {
            updateAt: 'desc',
          },
          take: wordLimit ?? 10,
          include: {
            wordEntry: true,
          },
        },
      },
    });
  }

  async paginateStudyLists(
    limit: number,
    cursor?: string,
    user?: User,
  ): Promise<Page<StudyList>> {
    const res = await this.prisma.studyList.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit,
      where: {
        updatedAt: cursor ? { lt: cursor } : undefined,
        userId: user?.id,
      },
    });
    const page = new Page<StudyList>();
    page.data = res;
    if (res.length > 0) {
      const rest = await this.prisma.studyList.count({
        where: {
          userId: user?.id,
          updatedAt: {
            lt: res[res.length - 1].updatedAt,
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        take: 1,
      });
      if (rest) {
        page.hasMore = true;
        page.cursor = res[res.length - 1].updatedAt.toISOString();
      }
    }
    return page;
  }

  async paginateWordsInStudyList(
    studyListId: string,
    limit: number,
    cursor?: string,
  ): Promise<Page<WordInStudyList>> {
    const res = await this.prisma.wordInStudyList.findMany({
      where: {
        studyListId: studyListId,
        updateAt: cursor
          ? {
              lt: cursor,
            }
          : undefined,
      },
      orderBy: {
        updateAt: 'desc',
      },
      take: limit,
      include: {
        wordEntry: true,
      },
    });
    const page = new Page<WordInStudyList>();
    page.data = res;
    if (res.length > 0) {
      const rest = await this.prisma.wordInStudyList.findFirst({
        where: {
          studyListId,
          updateAt: {
            lt: res[res.length - 1].updateAt,
          },
        },
        orderBy: {
          updateAt: 'desc',
        },
        take: 1,
      });
      if (rest) {
        page.hasMore = true;
        page.cursor = res[res.length - 1].updateAt.toISOString();
      }
    }
    return page;
  }

  async addWordToStudyList(
    studyListId: string,
    dto: AddWordToStudyListDTO,
    user?: User,
  ): Promise<WordInStudyList> {
    const entry = await this.prisma.wordEntry.findFirst({
      where: {
        id: dto.wordEntryId,
      },
    });
    if (!entry) {
      throw new NotFoundException('WordEntry not found');
    }
    return await this.prisma.wordInStudyList.create({
      data: {
        userId: user?.id,
        studyListId: studyListId,
        wordEntrySource: entry.source,
        word: entry.word,
      },
    });
  }
}
