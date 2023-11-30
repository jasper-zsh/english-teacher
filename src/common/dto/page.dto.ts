export class Page<T> {
    public data: T[]
    public hasMore: Boolean
    public cursor?: string
}