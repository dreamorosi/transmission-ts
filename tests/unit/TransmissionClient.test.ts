import { beforeEach, afterEach, describe, it, expect } from 'vitest';
import { TransmissionClient } from '../../src/TransmissionClient';
import {
  getBaseAuthHeader,
  getPingResponse,
  getRequestMatcher,
} from '../helpers';
import { successSession } from '../helpers/responses';
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

describe('Class: TransmissionClient', () => {
  describe('Constructor', () => {
    it('uses the default values when no config is provided', async () => {
      // Prepare
      mockPool.intercept(getRequestMatcher()).reply(200, getPingResponse());

      // Act
      const transmissionClient = new TransmissionClient();
      Reflect.set(transmissionClient, 'sessionId', '123');

      // Assert
      await transmissionClient.ping();
      expect(mockAgent.assertNoPendingInterceptors()).toBeUndefined();
    });
    it('uses the provided values when a config is provided', async () => {
      // Prepare
      // Override the default mockPool
      mockPool = mockAgent.get('https://somehost:9999');
      mockPool
        .intercept(
          getRequestMatcher({
            path: '/some/path',
            headers: {
              ...getBaseAuthHeader('user', 'pass'),
            },
            addAuthHeader: false,
          })
        )
        .reply(200, getPingResponse());

      // Act
      const transmissionClient = new TransmissionClient({
        protocol: 'https',
        hostname: 'somehost',
        port: 9999,
        username: 'user',
        password: 'pass',
        pathname: '/some/path',
      });
      Reflect.set(transmissionClient, 'sessionId', '123');

      // Assert
      await transmissionClient.ping();
      expect(mockAgent.assertNoPendingInterceptors()).toBeUndefined();
    });
  });
  describe('Method: ping', () => {
    it('obtains the sessionId, then returns successfully if the remote returns the expected response', async () => {
      // Prepare
      mockPool
        .intercept(
          getRequestMatcher({
            addSessionHeader: false,
          })
        )
        .reply(409, {}, { headers: { 'X-Transmission-Session-Id': '123' } });

      mockPool.intercept(getRequestMatcher()).reply(200, getPingResponse());
      const transmissionClient = new TransmissionClient();

      // Act & Assess
      await expect(transmissionClient.ping()).resolves.toBeUndefined();
      expect(mockAgent.assertNoPendingInterceptors()).toBeUndefined();
    });
    it('if unable to get the sessionId, it retries, then throws if unable multiple times', async () => {
      // Prepare
      mockPool.intercept(getRequestMatcher()).reply(409).times(3); // First request, then 2 retries
      mockPool
        .intercept(
          getRequestMatcher({
            addSessionHeader: false,
          })
        )
        .reply(409, {}, { headers: { 'X-Transmission-Session-Id': '123' } })
        .times(2);

      const transmissionClient = new TransmissionClient();
      Reflect.set(transmissionClient, 'sessionId', '123');
      Reflect.set(transmissionClient, 'invalidSessionRetry', {
        maxRetries: 2,
        count: 0,
        delay: 0,
      });

      // Act & Assess
      await expect(() =>
        transmissionClient.ping()
      ).rejects.toThrowErrorWithCause(
        'Transmission RPC endpoint did not return a session ID, max retries exceeded'
      );
      expect(mockAgent.assertNoPendingInterceptors()).toBeUndefined();
    });
    it('throws if the remote returns an unexpected response', async () => {
      // Prepare
      mockPool.intercept(getRequestMatcher()).reply(200, {
        arguments: {},
        result: 'something unexpected',
      });
      const transmissionClient = new TransmissionClient();
      Reflect.set(transmissionClient, 'sessionId', '123');

      // Act & Assess
      await expect(() => transmissionClient.ping()).rejects.toThrowError(
        'Unable to ping the Transmission RPC endpoint'
      );
      expect(mockAgent.assertNoPendingInterceptors()).toBeUndefined();
    });
    it('throws if the remote returns a non JSON response', async () => {
      // Prepare
      mockPool.intercept(getRequestMatcher()).reply(200, 'not json');
      const transmissionClient = new TransmissionClient();
      Reflect.set(transmissionClient, 'sessionId', '123');

      // Act & Assess
      await expect(() =>
        transmissionClient.ping()
      ).rejects.toThrowErrorWithCause(
        'Transmission RPC endpoint returned a non JSON response'
      );
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
      const transmissionClient = new TransmissionClient();

      // Act & Assess
      await expect(() => transmissionClient.getSession()).rejects.toThrowError(
        'Unable to obtain a session ID from the Transmission RPC endpoint'
      );
    });
    it('throws if the remote is down', async () => {
      // Prepare
      mockPool.intercept(getRequestMatcher()).reply(500);
      const transmissionClient = new TransmissionClient();
      Reflect.set(transmissionClient, 'sessionId', '123');

      // Act & Assess
      await expect(transmissionClient.ping()).rejects.toThrowErrorWithCause(
        'Transmission RPC endpoint returned status code 500'
      );
      expect(mockAgent.assertNoPendingInterceptors()).toBeUndefined();
    });
  });
  describe('Method: getSession', () => {
    it('returns the session payload when the request is successful', async () => {
      // Prepare
      mockPool
        .intercept(
          getRequestMatcher({
            body: JSON.stringify({
              method: 'session-get',
            }),
          })
        )
        .reply(200, successSession);
      const transmissionClient = new TransmissionClient();
      Reflect.set(transmissionClient, 'sessionId', '123');

      // Act
      const res = await transmissionClient.getSession();

      // Assert
      expect(res).toStrictEqual(successSession.arguments);
      expect(mockAgent.assertNoPendingInterceptors()).toBeUndefined();
    });
    it('throws an error when the request is unsuccessful', async () => {
      // Prepare
      mockPool
        .intercept(
          getRequestMatcher({
            body: JSON.stringify({
              method: 'session-get',
            }),
          })
        )
        .reply(400, {
          result: 'failure',
        });
      const transmissionClient = new TransmissionClient();
      Reflect.set(transmissionClient, 'sessionId', '123');

      // Act & Assess
      await expect(() => transmissionClient.getSession()).rejects.toThrowError(
        'Transmission RPC endpoint returned status code 400'
      );
    });
  });
});
