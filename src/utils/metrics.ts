export function incrementRequestCounter(route: string) {
  // basic prometheus counter mock
  console.log(`[Metrics] Incrementing counter for ${route}`);
}
