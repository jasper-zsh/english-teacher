export class Page<T> {
  public data: T[];
  public hasMore: boolean;
  public cursor?: string;
}
