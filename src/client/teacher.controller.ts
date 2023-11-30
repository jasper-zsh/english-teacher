import { AIInterface } from '@/ai/ai.interface';
import { Controller, Get } from '@nestjs/common';
import { Assistant } from '@prisma/client';

@Controller('teachers')
export class TeacherController {
  constructor(private ai: AIInterface) {}

  @Get()
  async listTeachers(): Promise<Assistant[]> {
    const assistants = await this.ai.listAssistants();
    return assistants;
  }
}
