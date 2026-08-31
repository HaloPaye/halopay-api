import { logger } from './logger.js';
export class TransactionQueue {
  private queue: any[] = [];
  
  enqueue(tx: any) {
    this.queue.push(tx);
    logger.info(`[Queue] Added transaction to offline queue. Length: ${this.queue.length}`);
  }
}
