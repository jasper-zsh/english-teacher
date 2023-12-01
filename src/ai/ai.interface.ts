import { Assistant, Conversation } from '@prisma/client';
import { MessageDTO } from './dto/message.dto';
import { Page } from '@/common/dto/page.dto';
import { CreateAssistantDTO } from './dto/assistant.dto';
import { Observable } from 'rxjs';

export enum Direction {
  FORWARD = 'FORWARD',
  BACKWARD = 'BACKWARD',
}

export abstract class AIInterface {
  abstract providerName(): string;
  abstract createAssistant(dto: CreateAssistantDTO): Promise<Assistant>;
  abstract listAssistants(): Promise<Assistant[]>;
  abstract createConversation(assistant: Assistant): Promise<Conversation>;
  abstract addTextMessageAndRun(
    conversation: Conversation,
    message: string,
  ): Promise<Observable<MessageDTO>>;
  abstract listMessages(
    conversation: Conversation,
    direction: Direction,
    limit: number,
    cursor?: string,
  ): Promise<Page<MessageDTO>>;
}
