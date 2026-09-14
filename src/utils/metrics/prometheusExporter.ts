export interface LatencyMetric {
  route: string;
  method: string;
  durationMs: number;
}

export class PrometheusLatencyHistogram {
  private buckets: number[];
  private counts: Map<string, number[]>;

  constructor(buckets: number[] = [10, 25, 50, 100, 250, 500, 1000]) {
    this.buckets = [...buckets].sort((a, b) => a - b);
    this.counts = new Map();
  }

  private getKey(route: string, method: string): string {
    return `${method.toUpperCase()} ${route}`;
  }

  public record(metric: LatencyMetric): void {
    const key = this.getKey(metric.route, metric.method);
    if (!this.counts.has(key)) {
      this.counts.set(key, new Array(this.buckets.length + 1).fill(0));
    }
    const arr = this.counts.get(key)!;
    let placed = false;
    for (let i = 0; i < this.buckets.length; i++) {
      if (metric.durationMs <= this.buckets[i]) {
        arr[i]++;
        placed = true;
        break;
      }
    }
    if (!placed) {
      arr[this.buckets.length]++; // +Inf bucket
    }
  }

  public getBucketCounts(route: string, method: string): number[] {
    const key = this.getKey(route, method);
    return this.counts.get(key) || new Array(this.buckets.length + 1).fill(0);
  }

  public getBuckets(): number[] {
    return this.buckets;
  }
}
