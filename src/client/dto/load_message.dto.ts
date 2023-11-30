import { Page } from "@/common/dto/page.dto"
import { ThreadMessage } from "openai/resources/beta/threads/messages/messages"

export class LoadMessageDTO {
    public direction: 'next' | 'previous'
    public page: Page<ThreadMessage>
}