export class Page<T> {
  public data: T[];
  public hasMore: boolean = false;
  public cursor?: string;

  public static from<S, T>(page: Page<S>, mapper: (a: S) => T): Page<T> {
    const res = new Page<T>();
    res.hasMore = page.hasMore;
    res.cursor = page.cursor;
    res.data = page.data.map(mapper);
    return res;
  }
}
