export function incrementRequestCounter(route: string) {
  // basic prometheus counter mock
  console.log(`[Metrics] Incrementing counter for ${route}`);
}
export const recordLatency = (ms: number) => {
  console.log(`Latency: ${ms}ms`);
};
