export class HorizonReconnectManager {
  private baseDelayMs: number;
  private maxDelayMs: number;
  private retryCount: number = 0;

  constructor(baseDelayMs: number = 1000, maxDelayMs: number = 30000) {
    this.baseDelayMs = baseDelayMs;
    this.maxDelayMs = maxDelayMs;
  }

  public getNextDelay(jitterFactor: number = 0.2): number {
    const rawDelay = Math.min(this.maxDelayMs, this.baseDelayMs * Math.pow(2, this.retryCount));
    this.retryCount += 1;
    const jitter = rawDelay * jitterFactor * (Math.random() * 2 - 1);
    return Math.max(this.baseDelayMs, Math.round(rawDelay + jitter));
  }

  public reset(): void {
    this.retryCount = 0;
  }

  public getAttempts(): number {
    return this.retryCount;
  }
}