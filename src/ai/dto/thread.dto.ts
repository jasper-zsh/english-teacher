import { Thread } from 'openai/resources/beta/threads/threads';

export class ThreadDTO {
  public id: string;
  public createdAt: number;

  public static newFromAPI(thread: Thread): ThreadDTO {
    const dto = new ThreadDTO();
    dto.id = thread.id;
    dto.createdAt = thread.created_at;
    return dto;
  }
}
