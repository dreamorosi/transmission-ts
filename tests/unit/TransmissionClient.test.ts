import { beforeEach, afterEach, describe, it, expect } from 'vitest';
import { TransmissionClient } from '../../src/TransmissionClient';
import {
  getBaseAuthHeader,
  getPingResponse,
  getRequestMatcher,
} from '../helpers';
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
      await expect(() => transmissionClient.ping()).rejects.toThrowError(
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
      await expect(() => transmissionClient.ping()).rejects.toThrowError(
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
      await expect(transmissionClient.ping()).rejects.toThrowError(
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
        .reply(200, {
          arguments: {
            // 'alt-speed-down': 50,
            'alt-speed-enabled': false,
            'alt-speed-time-begin': 540,
            'alt-speed-time-day': 127,
            'alt-speed-time-enabled': false,
            'alt-speed-time-end': 1020,
            'alt-speed-up': 50,
            'blocklist-enabled': false,
            'blocklist-size': 0,
            'blocklist-url': 'http://www.example.com/blocklist',
            'cache-size-mb': 4,
            'config-dir': '/home/user/.config/transmission-daemon',
            'dht-enabled': true,
            'download-dir': '/mnt/vault/torrent-complete',
            'download-dir-free-space': 115761504256,
            'download-queue-enabled': true,
            'download-queue-size': 2,
            encryption: 'preferred',
            'idle-seeding-limit': 30,
            'idle-seeding-limit-enabled': false,
            'incomplete-dir': '/mnt/vault/torrent-inprogress',
            'incomplete-dir-enabled': true,
            'lpd-enabled': false,
            'peer-limit-global': 200,
            'peer-limit-per-torrent': 50,
            'peer-port': 51413,
            'peer-port-random-on-start': false,
            'pex-enabled': true,
            'port-forwarding-enabled': false,
            'queue-stalled-enabled': true,
            'queue-stalled-minutes': 10,
            'rename-partial-files': true,
            'rpc-version': 16,
            'rpc-version-minimum': 1,
            'script-torrent-done-enabled': true,
            'script-torrent-done-filename':
              '/var/lib/transmission-daemon/test.sh',
            'seed-queue-enabled': false,
            'seed-queue-size': 10,
            seedRatioLimit: 0,
            seedRatioLimited: true,
            'session-id': '3PA3MX0dH3gl40hV3JFHuCKxum4Pcxjo2MU3cWhfDoaFi9K8',
            'speed-limit-down': 100,
            'speed-limit-down-enabled': false,
            'speed-limit-up': 100,
            'speed-limit-up-enabled': false,
            'start-added-torrents': true,
            'trash-original-torrent-files': false,
            units: {
              'memory-bytes': 1024,
              'memory-units': ['KiB', 'MiB', 'GiB', 'TiB'],
              'size-bytes': 1000,
              'size-units': ['kB', 'MB', 'GB', 'TB'],
              'speed-bytes': 1000,
              'speed-units': ['kB/s', 'MB/s', 'GB/s', 'TB/s'],
            },
            'utp-enabled': true,
            version: '3.00 (bb6b5a062e)',
          },
          result: 'success',
        });
      const transmissionClient = new TransmissionClient();
      Reflect.set(transmissionClient, 'sessionId', '123');

      // Act
      const res = await transmissionClient.getSession();

      // Assert
      expect(res).toStrictEqual({
        'alt-speed-down': 50,
        'alt-speed-enabled': false,
        'alt-speed-time-begin': 540,
        'alt-speed-time-day': 127,
        'alt-speed-time-enabled': false,
        'alt-speed-time-end': 1020,
        'alt-speed-up': 50,
        'blocklist-enabled': false,
        'blocklist-size': 0,
        'blocklist-url': 'http://www.example.com/blocklist',
        'cache-size-mb': 4,
        'config-dir': '/home/user/.config/transmission-daemon',
        'dht-enabled': true,
        'download-dir': '/mnt/vault/torrent-complete',
        'download-dir-free-space': 115761504256,
        'download-queue-enabled': true,
        'download-queue-size': 2,
        encryption: 'preferred',
        'idle-seeding-limit': 30,
        'idle-seeding-limit-enabled': false,
        'incomplete-dir': '/mnt/vault/torrent-inprogress',
        'incomplete-dir-enabled': true,
        'lpd-enabled': false,
        'peer-limit-global': 200,
        'peer-limit-per-torrent': 50,
        'peer-port': 51413,
        'peer-port-random-on-start': false,
        'pex-enabled': true,
        'port-forwarding-enabled': false,
        'queue-stalled-enabled': true,
        'queue-stalled-minutes': 10,
        'rename-partial-files': true,
        'rpc-version': 16,
        'rpc-version-minimum': 1,
        'script-torrent-done-enabled': true,
        'script-torrent-done-filename': '/var/lib/transmission-daemon/test.sh',
        'seed-queue-enabled': false,
        'seed-queue-size': 10,
        seedRatioLimit: 0,
        seedRatioLimited: true,
        'session-id': '3PA3MX0dH3gl40hV3JFHuCKxum4Pcxjo2MU3cWhfDoaFi9K8',
        'speed-limit-down': 100,
        'speed-limit-down-enabled': false,
        'speed-limit-up': 100,
        'speed-limit-up-enabled': false,
        'start-added-torrents': true,
        'trash-original-torrent-files': false,
        units: {
          'memory-bytes': 1024,
          'memory-units': ['KiB', 'MiB', 'GiB', 'TiB'],
          'size-bytes': 1000,
          'size-units': ['kB', 'MB', 'GB', 'TB'],
          'speed-bytes': 1000,
          'speed-units': ['kB/s', 'MB/s', 'GB/s', 'TB/s'],
        },
        'utp-enabled': true,
        version: '3.00 (bb6b5a062e)',
      });
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
