import { ThreadMessage } from 'openai/resources/beta/threads/messages/messages';
import { MessageDTO } from './dto/message.dto';

export function newMessageFromAPI(msg: ThreadMessage): MessageDTO {
  const dto = new MessageDTO();
  dto.id = msg.id;
  if (msg.content[0].type === 'text') {
    dto.text = msg.content[0].text.value;
  }
  return dto;
}
