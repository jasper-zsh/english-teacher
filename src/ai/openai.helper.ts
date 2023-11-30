import { Assistant } from "openai/resources/beta/assistants/assistants";
import { AssistantDTO } from "./dto/assistant.dto";
import { ThreadMessage } from "openai/resources/beta/threads/messages/messages";
import { MessageDTO } from "./dto/message.dto";

export function newAssistantFromAPI(assistant: Assistant): AssistantDTO {
const dto = new AssistantDTO();
dto.assistantId = assistant.id;
dto.name = assistant.name;
return dto;
}

export function newMessageFromAPI(msg: ThreadMessage): MessageDTO {
    const dto = new MessageDTO();
    dto.id = msg.id;
    if (msg.content[0].type === 'text') {
        dto.text = msg.content[0].text.value;
    }
    return dto;
}