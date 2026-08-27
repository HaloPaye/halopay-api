export class TransactionQueue {
  private queue: any[] = [];
  
  enqueue(tx: any) {
    this.queue.push(tx);
    console.log(`[Queue] Added transaction to offline queue. Length: ${this.queue.length}`);
  }
}
