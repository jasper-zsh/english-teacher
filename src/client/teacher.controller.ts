import { AIService } from '@/ai/ai.service';
import { TeacherDTO } from '@/ai/dto/teacher.dto';
import { Controller, Get } from '@nestjs/common';

@Controller('teachers')
export class TeacherController {
  constructor(private aiService: AIService) {}

  @Get()
  async listTeachers(): Promise<TeacherDTO[]> {
    return this.aiService.listTeachers();
  }
}
