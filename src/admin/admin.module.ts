import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AIModule } from "@/ai/ai.module";

@Module({
    imports: [AIModule],
    controllers: [AdminController],
})
export class AdminModule {}