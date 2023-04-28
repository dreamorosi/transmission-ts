import { beforeEach, afterEach, describe, it, expect } from 'vitest';
import { SessionService } from '../../src/SessionService';
import { getBaseAuthHeader, getRequestMatcher } from '../helpers';
import { setGlobalDispatcher, MockAgent } from 'undici';
import type { Interceptable } from 'undici';

let mockAgent: MockAgent;
let mockPool: Interceptable;

beforeEach(() => {
  mockAgent = new MockAgent({
    keepAliveTimeout: 10,
    keepAliveMaxTimeout: 10,
  });
  mockAgent.disableNetConnect();
  setGlobalDispatcher(mockAgent);
  mockPool = mockAgent.get('http://localhost:9091');
});

afterEach(async () => {
  await mockAgent.close();
});

describe('Class: SessionService', () => {
  describe('Method: getSessionId', () => {
    it('obtains the sessionId, then returns it', async () => {
      // Prepare
      mockPool
        .intercept(
          getRequestMatcher({
            addSessionHeader: false,
          })
        )
        .reply(409, {}, { headers: { 'X-Transmission-Session-Id': '123' } });
      const sessionService = new SessionService({
        pathname: 'http://localhost:9091/transmission/rpc',
        authorization: getBaseAuthHeader().Authorization,
      });

      // Act
      const sessionId = await sessionService.getSessionId();

      // Assess
      expect(sessionId).toBe('123');
      expect(mockAgent.assertNoPendingInterceptors()).toBeUndefined();
    });
    it('if a sessionId is present, it returns it without making a second request', async () => {
      // Prepare
      mockPool
        .intercept(
          getRequestMatcher({
            addSessionHeader: false,
          })
        )
        .reply(409, {}, { headers: { 'X-Transmission-Session-Id': '123' } })
        .times(1);
      const sessionService = new SessionService({
        pathname: 'http://localhost:9091/transmission/rpc',
        authorization: getBaseAuthHeader().Authorization,
      });

      // Act
      await sessionService.getSessionId();
      await sessionService.getSessionId();

      // Assess
      expect(mockAgent.assertNoPendingInterceptors()).toBeUndefined();
    });
    it('throws an error when unable to obtain the sessionId', async () => {
      // Prepare
      mockPool
        .intercept(
          getRequestMatcher({
            addSessionHeader: false,
          })
        )
        .reply(410);
      const sessionService = new SessionService({
        pathname: 'http://localhost:9091/transmission/rpc',
        authorization: getBaseAuthHeader().Authorization,
      });

      // Act & Assess
      await expect(() => sessionService.getSessionId()).rejects.toThrowError(
        'Unable to obtain a session ID from the Transmission RPC endpoint'
      );
    });
  });
  describe('Method: resetSessionId', () => {
    it('resets the sessionId', async () => {
      mockPool
        .intercept(
          getRequestMatcher({
            addSessionHeader: false,
          })
        )
        .reply(409, {}, { headers: { 'X-Transmission-Session-Id': '123' } })
        .times(2);
      const sessionService = new SessionService({
        pathname: 'http://localhost:9091/transmission/rpc',
        authorization: getBaseAuthHeader().Authorization,
      });
      await sessionService.getSessionId();

      // Act
      sessionService.resetSessionId();
      await sessionService.getSessionId();

      // Assess
      expect(mockAgent.assertNoPendingInterceptors()).toBeUndefined();
    });
  });
});
