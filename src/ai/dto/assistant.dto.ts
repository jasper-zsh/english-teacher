import { Assistant } from '@prisma/client';

export class AssistantDTO {
  public id: number;
  public name: string;

  public static newFromDB(assistant: Assistant): AssistantDTO {
    const dto = new AssistantDTO();
    dto.id = assistant.id;
    dto.name = assistant.name;
    return dto;
  }
}

export class CreateAssistantDTO {
  public name: string;
  public prompt: string;
}
