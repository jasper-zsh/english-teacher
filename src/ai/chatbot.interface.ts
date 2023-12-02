import { Conversation } from '@prisma/client';
import { ContextMessage } from './dto/message.dto';

export interface ChatbotInterface {
  buildContext(conversation: Conversation): Promise<ContextMessage[]>;
}
