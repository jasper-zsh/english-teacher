import { AIInterface } from '@/ai/ai.interface';
import { AssistantDTO } from '@/ai/dto/assistant.dto';
import { Controller, Get } from '@nestjs/common';

@Controller('assistants')
export class AssistantController {
  constructor(private ai: AIInterface) {}

  @Get()
  async listAssistants(): Promise<AssistantDTO[]> {
    const assistants = await this.ai.listAssistants();
    return assistants.map(AssistantDTO.newFromDB);
  }
}
