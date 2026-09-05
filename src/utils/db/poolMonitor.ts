export interface PoolStats {
  totalCount: number;
  idleCount: number;
  waitingCount: number;
  isSaturated: boolean;
}

export class PoolMonitor {
  private maxClients: number;
  private currentTotal: number = 0;
  private currentIdle: number = 0;
  private currentWaiting: number = 0;

  constructor(maxClients: number = 20) {
    this.maxClients = maxClients;
  }

  public updateCounts(total: number, idle: number, waiting: number): void {
    this.currentTotal = total;
    this.currentIdle = idle;
    this.currentWaiting = waiting;
  }

  public getStats(): PoolStats {
    const isSaturated = this.currentTotal >= this.maxClients && this.currentIdle === 0;
    return {
      totalCount: this.currentTotal,
      idleCount: this.currentIdle,
      waitingCount: this.currentWaiting,
      isSaturated,
    };
  }

  public calculateHealthScore(): number {
    if (this.maxClients === 0) return 100;
    const utilization = this.currentTotal / this.maxClients;
    const waitingPenalty = Math.min(50, this.currentWaiting * 10);
    return Math.max(0, Math.round((1 - utilization) * 100 - waitingPenalty));
  }
}