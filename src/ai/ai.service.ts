import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import config from '@/config';
import { TeacherDTO } from './dto/teacher.dto';

@Injectable()
export class AIService {
  private readonly openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.OPENAI_API_KEY,
    });
  }

  async listTeachers(): Promise<TeacherDTO[]> {
    const res = await this.openai.beta.assistants.list();
    return res.data.map(TeacherDTO.newFromAPI);
  }
}
