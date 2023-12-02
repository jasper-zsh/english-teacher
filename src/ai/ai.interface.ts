import { Conversation, Message } from '@prisma/client';
import { MessageDTO } from './dto/message.dto';
import { Page } from '@/common/dto/page.dto';
import { ChatbotInterface } from './chatbot.interface';

export enum Direction {
  FORWARD = 'FORWARD',
  BACKWARD = 'BACKWARD',
}

export abstract class AIInterface {
  abstract providerName(): string;
  abstract chatText(
    conversation: Conversation,
    bot: ChatbotInterface,
    message: Message,
  ): Promise<Message>;
  abstract listMessages(
    conversation: Conversation,
    direction: Direction,
    limit: number,
    cursor?: Date,
  ): Promise<Page<MessageDTO>>;
}
