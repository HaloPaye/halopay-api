export function generateIdempotencyKey(txId: string): string {
  return "idem_${txId}_${Date.now()}";
}
