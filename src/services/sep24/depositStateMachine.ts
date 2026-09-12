export type DepositStatus =
  | 'incomplete'
  | 'pending_anchor'
  | 'pending_user_transfer_start'
  | 'pending_stellar'
  | 'completed'
  | 'error';

const ALLOWED_TRANSITIONS: Record<DepositStatus, DepositStatus[]> = {
  incomplete: ['pending_anchor', 'error'],
  pending_anchor: ['pending_user_transfer_start', 'error'],
  pending_user_transfer_start: ['pending_stellar', 'error'],
  pending_stellar: ['completed', 'error'],
  completed: [],
  error: [],
};

export class DepositStateMachine {
  public static isValidTransition(current: DepositStatus, next: DepositStatus): boolean {
    const allowed = ALLOWED_TRANSITIONS[current] || [];
    return allowed.includes(next);
  }

  public static isTerminal(status: DepositStatus): boolean {
    return status === 'completed' || status === 'error';
  }
}
