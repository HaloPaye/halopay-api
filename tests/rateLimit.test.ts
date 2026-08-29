import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

// Note: ioredis needs to be mocked or a local redis instance must be running.
// If redis is down, it fails open, so for a unit test, we should mock the redis client or the middleware.
// For true integration test, we can mock the ioredis package.

jest.mock('ioredis', () => {
  const RedisMock = jest.fn().mockImplementation(() => {
    let requests = 0;
    return {
      on: jest.fn(),
      multi: jest.fn().mockReturnValue({
        zremrangebyscore: jest.fn().mockReturnThis(),
        zadd: jest.fn().mockReturnThis(),
        zcard: jest.fn().mockReturnThis(),
        pexpire: jest.fn().mockReturnThis(),
        exec: jest.fn().mockImplementation(async () => {
          requests++;
          return [[null, 1], [null, 1], [null, requests], [null, 1]];
        })
      })
    };
  });
  return RedisMock;
});

import { Keypair } from '@stellar/stellar-sdk';

describe('SEP-10 Rate Limiting Integration', () => {
  it('should return 429 Too Many Requests after 100 requests', async () => {
    // Generate a valid random Stellar public key for the test
    const clientAccount = Keypair.random().publicKey();

    // Send 100 successful requests
    for (let i = 0; i < 100; i++) {
      const res = await request(app)
        .get(`/api/v1/auth/challenge?account=${clientAccount}`);
      expect(res.status).toBe(200);
    }

    // 101st request should be rate limited
    const resLimited = await request(app)
      .get(`/api/v1/auth/challenge?account=${clientAccount}`);
    expect(resLimited.status).toBe(429);
    expect(resLimited.body.error.message).toBe('Too many requests from this IP, please try again later.');
  });
});
