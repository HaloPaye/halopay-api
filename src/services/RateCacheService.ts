export class RateCacheService {
  public ttl: number;

  constructor(ttl: number = 30000) {
    this.ttl = ttl;
  }

  public getTTL(): number {
    return this.ttl;
  }
}