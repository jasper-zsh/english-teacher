import { Assistant } from 'openai/resources/beta/assistants/assistants';

export class TeacherDTO {
  public assistantId: string;
  public name: string;

  public static newFromAPI(assistant: Assistant): TeacherDTO {
    const dto = new TeacherDTO();
    dto.assistantId = assistant.id;
    dto.name = assistant.name;
    return dto;
  }
}
