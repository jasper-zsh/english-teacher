import { Page } from "@/common/dto/page.dto";
import { AIInterface, Direction } from "./ai.interface";
import { MessageDTO } from "./dto/message.dto";
import { Injectable } from "@nestjs/common";
import { CreateAssistantDTO } from "./dto/assistant.dto";
import { PrismaService } from "@/prisma.service";
import { Assistant, Conversation } from "@prisma/client";
import OpenAI from "openai";
import Config from "@/config";

@Injectable()
export class LlamaService extends AIInterface {
    private client: OpenAI

    constructor(private prisma: PrismaService) {
        super();
        this.client = new OpenAI({
            apiKey: Config.LLAMA_API_TOKEN,
            baseURL: 'https://api.llama-api.com'
        })
    }

    providerName(): string {
        return 'llama';
    }

    async createAssistant(dto: CreateAssistantDTO): Promise<Assistant> {
        return await this.prisma.assistant.create({
            data: {
                provider: this.providerName(),
                name: dto.name,
                prompt: dto.prompt,
            }
        })
    }
    async listAssistants(): Promise<Assistant[]> {
        return await this.prisma.assistant.findMany({
            where: {
                provider: {
                    equals: this.providerName(),
                }
            }
        })
    }
    async createConversation(assistant: Assistant): Promise<Conversation> {
        return await this.prisma.conversation.create({
            data: {
                provider: this.providerName(),
                assistantId: assistant.id,
            }
        })
    }
    async addTextMessageAndRun(conversation: Conversation, message: string): Promise<void> {
        await this.prisma.message.create({
            data: {
                conversationId: conversation.id,
                role: 'user',
                text: message,
            }
        })
        const msgs = await this.prisma.message.findMany({
            where: {
                conversationId: conversation.id,
            }
        })
        const assistant = await this.prisma.assistant.findFirstOrThrow({
            where: {
                id: conversation.assistantId,
            }
        })
        const contents = [
            {
                role: 'system',
                content: assistant.prompt,
            },
            ...msgs.map(m => ({
                role: m.role,
                content: m.text,
            }))
        ]
        const res = await this.client.chat.completions.create({
            model: 'llama-13b-chat',
            // @ts-ignore
            messages: contents,
        })
        await this.prisma.message.create({
            data: {
                conversationId: conversation.id,
                role: res.choices[0].message.role,
                text: res.choices[0].message.content,
            }
        })
    }
    async listMessages(conversation: Conversation, direction: Direction, limit: number, cursor?: string): Promise<Page<MessageDTO>> {
        const msgs = await this.prisma.message.findMany({
            where: {
                conversationId: conversation.id,
                id: cursor ? {
                    gt: direction === Direction.FORWARD ? Number(cursor) : undefined,
                    lt: direction === Direction.BACKWARD ? Number(cursor) : undefined,
                } : undefined,
            },
            orderBy: [{
                id: direction === Direction.FORWARD ? 'asc' : 'desc'
            }],
            take: limit,
        })
        const r = new Page<MessageDTO>()
        r.data = msgs.map(m => {
            const dto = new MessageDTO();
            dto.id = m.id.toString();
            dto.role = m.role;
            dto.text = m.text;
            return dto;
        });
        r.hasMore = false;
        if (msgs.length === 0) {
            return r;
        }
        if (direction === Direction.FORWARD) {
            const last = await this.prisma.message.findFirst({
                where: {
                    conversationId: conversation.id,
                },
                orderBy: [{
                    id: 'asc'
                }]
            });
            if (msgs[msgs.length - 1].id != last.id) {
                r.hasMore = true;
                r.cursor = msgs[msgs.length - 1].id.toString();
            }
        } else {
            const first = await this.prisma.message.findFirst({
                where: {
                    conversationId: conversation.id,
                },
                orderBy: [{
                    id: 'desc'
                }]
            });
            if (msgs[msgs.length - 1].id !== first.id) {
                r.hasMore = true;
                r.cursor = msgs[msgs.length - 1].id.toString();
            }
        }
        return r;
    }
}