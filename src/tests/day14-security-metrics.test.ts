import { createCspMiddleware } from '../middleware/cspMiddleware';
import { PrometheusLatencyHistogram } from '../utils/metrics/prometheusExporter';
import { JwtRotationService } from '../services/auth/jwtRotationService';
import { formatProblemDetails } from '../utils/logging/errorFormatter';

describe('Day 14 API Security and Telemetry Suite', () => {
  test('createCspMiddleware sets strict headers', () => {
    const middleware = createCspMiddleware({ allowedOrigins: ['https://app.halopay.io'] });
    const headers: Record<string, string> = {};
    const req = {} as any;
    const res = {
      setHeader: (k: string, v: string) => {
        headers[k] = v;
      },
    } as any;
    let nextCalled = false;

    middleware(req, res, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(true);
    expect(headers['Content-Security-Policy']).toContain("default-src 'none'");
    expect(headers['Content-Security-Policy']).toContain('https://app.halopay.io');
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['X-Frame-Options']).toBe('DENY');
  });

  test('PrometheusLatencyHistogram records durations accurately', () => {
    const hist = new PrometheusLatencyHistogram([50, 100, 200]);
    hist.record({ route: '/api/v1/auth', method: 'GET', durationMs: 40 });
    hist.record({ route: '/api/v1/auth', method: 'GET', durationMs: 80 });
    hist.record({ route: '/api/v1/auth', method: 'GET', durationMs: 500 });

    const counts = hist.getBucketCounts('/api/v1/auth', 'GET');
    expect(counts[0]).toBe(1); // <= 50
    expect(counts[1]).toBe(1); // <= 100
    expect(counts[3]).toBe(1); // +Inf (> 200)
  });

  test('JwtRotationService manages active primary key and verification lookups', () => {
    const svc = new JwtRotationService();
    svc.registerKey('key_1', 'PUB_KEY_1', true);
    expect(svc.getSigningKeyId()).toBe('key_1');
    expect(svc.getVerificationKey('key_1')).toBe('PUB_KEY_1');

    svc.registerKey('key_2', 'PUB_KEY_2', true);
    expect(svc.getSigningKeyId()).toBe('key_2');
    expect(svc.getVerificationKey('key_1')).toBe('PUB_KEY_1'); // still verifiable
    expect(svc.totalKeys()).toBe(2);
  });

  test('formatProblemDetails formats RFC-7807 problem details', () => {
    const err = new Error('Custom not found');
    (err as any).status = 404;

    const problem = formatProblemDetails(err, '/api/v1/items/99', false);
    expect(problem.status).toBe(404);
    expect(problem.title).toBe('Request Error');
    expect(problem.detail).toBe('Custom not found');
    expect(problem.instance).toBe('/api/v1/items/99');
  });
});
