import { Run } from "openai/resources/beta/threads/runs/runs";

export class RunDTO {
    public threadId: string;
    public id: string;

    public static newFromAPI(run: Run): RunDTO {
        const res = new RunDTO();
        res.threadId = run.thread_id;
        res.id = run.id
        return res;
    }
}