import { afterEach, describe, it, expect, vi } from 'vitest';
import { TransmissionClient } from '../../src/TransmissionClient';
import { getDummyRequestService, getPingResponse } from '../helpers';
import { successSession } from '../helpers/responses';
import { torrentList } from '../helpers/responses/torrent';

afterEach(async () => {
  vi.resetAllMocks();
});

describe('Class: TransmissionClient', () => {
  /* describe('Constructor', () => {
    it('uses the default values when no config is provided', async () => {
      // Prepare
      mockPool.intercept(getRequestMatcher()).reply(200, getPingResponse());

      // Act
      const transmissionClient = new TransmissionClient(
        {},
        new SessionDummy('', '')
      );

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
      const transmissionClient = new TransmissionClient(
        {
          protocol: 'https',
          hostname: 'somehost',
          port: 9999,
          username: 'user',
          password: 'pass',
          pathname: '/some/path',
        },
        new SessionDummy('', '')
      );

      // Assert
      await transmissionClient.ping();
      expect(mockAgent.assertNoPendingInterceptors()).toBeUndefined();
    });
  }); */
  describe('Method: ping', () => {
    it('returns successfully if the remote returns the expected response', async () => {
      // Prepare
      const requestService = getDummyRequestService();
      vi.spyOn(requestService, 'request').mockResolvedValue(getPingResponse());
      const transmissionClient = new TransmissionClient({
        customServices: {
          requestService,
        },
      });

      // Act & Assess
      await expect(transmissionClient.ping()).resolves.toBeUndefined();
    });
    it('throws if the remote returns an unexpected response', async () => {
      // Prepare
      const requestService = getDummyRequestService();
      vi.spyOn(requestService, 'request').mockResolvedValue({
        arguments: {},
        result: 'something unexpected',
      });
      const transmissionClient = new TransmissionClient({
        customServices: {
          requestService,
        },
      });

      // Act & Assess
      await expect(() => transmissionClient.ping()).rejects.toThrowError(
        'Unable to ping the Transmission RPC endpoint'
      );
    });
  });
  describe('Method: getSession', () => {
    it('returns the session payload when the request is successful', async () => {
      // Prepare
      const requestService = getDummyRequestService();
      vi.spyOn(requestService, 'request').mockResolvedValue(successSession);
      const transmissionClient = new TransmissionClient({
        customServices: {
          requestService,
        },
      });

      // Act
      const res = await transmissionClient.getSession();

      // Assert
      expect(res).toStrictEqual(successSession.arguments);
      expect(requestService.request).toHaveBeenCalledWith(
        JSON.stringify({
          method: 'session-get',
        })
      );
    });
    it('throws an error when the request is unsuccessful', async () => {
      // Prepare
      const requestService = getDummyRequestService();
      vi.spyOn(requestService, 'request').mockResolvedValue({
        arguments: {},
        result: 'failure',
      });
      const transmissionClient = new TransmissionClient({
        customServices: {
          requestService,
        },
      });

      // Act & Assess
      await expect(() => transmissionClient.getSession()).rejects.toThrowError(
        'Unable to get session info from Transmission RPC endpoint'
      );
    });
  });
  describe('Method: listTorrents', () => {
    it('returns all the torrents when the request is successful', async () => {
      // Prepare
      const requestService = getDummyRequestService();
      vi.spyOn(requestService, 'request').mockResolvedValue(torrentList);
      const transmissionClient = new TransmissionClient({
        customServices: {
          requestService,
        },
      });

      // Act
      const res = await transmissionClient.listTorrents();

      // Assert
      expect(res).toStrictEqual(torrentList.arguments.torrents);
      expect(requestService.request).toHaveBeenCalledWith(
        JSON.stringify({
          method: 'torrent-get',
        })
      );
    });
    it('throws an error when the request is unsuccessful', async () => {
      // Prepare
      const requestService = getDummyRequestService();
      vi.spyOn(requestService, 'request').mockResolvedValue({
        arguments: {},
        result: 'failure',
      });
      const transmissionClient = new TransmissionClient({
        customServices: {
          requestService,
        },
      });

      // Act & Assess
      await expect(() =>
        transmissionClient.listTorrents()
      ).rejects.toThrowError(
        'Unable to get torrents from Transmission RPC endpoint'
      );
    });
  });
});
