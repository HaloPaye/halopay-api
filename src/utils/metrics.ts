import { logger } from './logger.js';
export function incrementRequestCounter(route: string) {
  // basic prometheus counter mock
  logger.info(`[Metrics] Incrementing counter for ${route}`);
}
export const recordLatency = (ms: number) => {
  logger.info(`Latency: ${ms}ms`);
};
