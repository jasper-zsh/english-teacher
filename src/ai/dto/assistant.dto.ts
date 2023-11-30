import { Assistant } from 'openai/resources/beta/assistants/assistants';

export class AssistantDTO {
  public assistantId: string;
  public name: string;
}

export class CreateAssistantDTO {
  public name: string;
  public prompt: string;
}