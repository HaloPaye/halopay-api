import { DepositStateMachine } from '../services/sep24/depositStateMachine';

describe('DepositStateMachine Unit Tests', () => {
  it('should allow valid linear progression', () => {
    expect(DepositStateMachine.isValidTransition('incomplete', 'pending_anchor')).toBe(true);
    expect(DepositStateMachine.isValidTransition('pending_anchor', 'pending_user_transfer_start')).toBe(true);
    expect(DepositStateMachine.isValidTransition('pending_user_transfer_start', 'pending_stellar')).toBe(true);
    expect(DepositStateMachine.isValidTransition('pending_stellar', 'completed')).toBe(true);
  });

  it('should disallow invalid skips or reversed transitions', () => {
    expect(DepositStateMachine.isValidTransition('incomplete', 'completed')).toBe(false);
    expect(DepositStateMachine.isValidTransition('completed', 'incomplete')).toBe(false);
    expect(DepositStateMachine.isValidTransition('pending_stellar', 'incomplete')).toBe(false);
  });

  it('should recognize terminal states', () => {
    expect(DepositStateMachine.isTerminal('completed')).toBe(true);
    expect(DepositStateMachine.isTerminal('error')).toBe(true);
    expect(DepositStateMachine.isTerminal('pending_stellar')).toBe(false);
  });
});
