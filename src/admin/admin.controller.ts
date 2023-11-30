import { AIInterface } from "@/ai/ai.interface";
import { CreateAssistantDTO } from "@/ai/dto/assistant.dto";
import { Body, Controller, Get, Post } from "@nestjs/common";
import { Assistant } from "@prisma/client";

@Controller('admin')
export class AdminController {
    constructor(private ai: AIInterface) {}

    @Post('assistants')
    async createAssistant(@Body() dto: CreateAssistantDTO): Promise<Assistant> {
        const res = await this.ai.createAssistant(dto);
        return res;
    }

    @Get('assistants')
    async listAssistants(): Promise<Assistant[]> {
        return await this.ai.listAssistants();
    }
}