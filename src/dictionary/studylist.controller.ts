import { AuthenticatedGuard } from '@/auth/authenticated.guard';
import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { StudyListService } from './studylist.service';
import {
  AddWordToStudyListDTO,
  CreateStudyListDTO,
  StudyListDTO,
  WordInStudyListDTO,
} from './dto/studylist.dto';
import { Page } from '@/common/dto/page.dto';

@Controller('studylists')
@UseGuards(AuthenticatedGuard)
export class StudyListController {
  constructor(private studyList: StudyListService) {}

  @Post()
  async createStudyList(@Request() req, @Body() dto: CreateStudyListDTO) {
    return await this.studyList.createStudyList(dto, req.user);
  }

  @Get()
  async listStudyLists(
    @Request() req,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('cursor') cursor?: string,
  ) {
    return await this.studyList.paginateStudyLists(limit, cursor, req.user);
  }

  @Get(':id')
  async getStudyList(
    @Request() req,
    @Param('id') id: string,
  ): Promise<StudyListDTO> {
    const res = await this.studyList.getStudyList(id);
    if (res.userId && res.userId !== req.user.id) {
      throw new NotFoundException('StudyList not found');
    }
    return StudyListDTO.fromDB(res);
  }

  @Post(':id/word')
  async addWordToStudyList(
    @Request() req,
    @Param('id') studyListId: string,
    @Body() dto: AddWordToStudyListDTO,
  ) {
    return await this.studyList.addWordToStudyList(studyListId, dto, req.user);
  }

  @Get(':id/words')
  async paginateWordsInStudyList(
    @Param('id') studyListId: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('cursor') cursor?: string,
  ): Promise<Page<WordInStudyListDTO>> {
    const res = await this.studyList.paginateWordsInStudyList(
      studyListId,
      limit,
      cursor,
    );
    return Page.from(res, WordInStudyListDTO.fromDB);
  }
}
