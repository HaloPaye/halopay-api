import { ModuleIntegrityAuditor } from '../utils/cleanup/moduleIntegrity';

describe('Module Integrity and Export Cleaner Suite', () => {
  test('auditor correctly identifies unused exported symbols', () => {
    const auditor = new ModuleIntegrityAuditor();
    auditor.registerModule('authService', ['verifyToken', 'rotateKey', 'deprecatedLogin', 'legacyHash'], 3);

    const activeSymbols = ['verifyToken', 'rotateKey'];
    const unused = auditor.detectUnusedExports(activeSymbols, 'authService');

    expect(unused).toEqual(['deprecatedLogin', 'legacyHash']);
  });

  test('auditor handles empty or unknown modules gracefully', () => {
    const auditor = new ModuleIntegrityAuditor();
    expect(auditor.detectUnusedExports(['foo'], 'unknownModule')).toEqual([]);
    expect(auditor.getRegisteredModuleCount()).toBe(0);
  });
});
