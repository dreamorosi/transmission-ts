import { afterEach, describe, it, expect, vi } from 'vitest';
import { TransmissionClient } from '../../src/TransmissionClient';
import { AllTorrentFields } from '../../src/helpers';
import { getDummyRequestService, getPingResponse } from '../helpers';
import { successSession } from '../helpers/responses';
import {
  recentlyActiveTorrentList,
  torrentList,
  torrentListWithFields,
  addNewTorrent,
  addDuplicateTorrent,
} from '../helpers/responses/torrent';

afterEach(async () => {
  vi.resetAllMocks();
});

describe('Class: TransmissionClient', () => {
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
    it('requests all fields and applies no filters by default and returns all the torrents', async () => {
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
      expect(res).toStrictEqual(
        torrentList.arguments.torrents.map((t) => ({
          ...t,
          status: 'DOWNLOADING',
        }))
      );
      expect(requestService.request).toHaveBeenCalledWith(
        JSON.stringify({
          method: 'torrent-get',
          arguments: {
            fields: AllTorrentFields,
          },
        })
      );
    });
    it('requests only the provided fields and applies no filters and returns all the torrents', async () => {
      // Prepare
      const requestService = getDummyRequestService();
      vi.spyOn(requestService, 'request').mockResolvedValue(
        torrentListWithFields
      );
      const transmissionClient = new TransmissionClient({
        customServices: {
          requestService,
        },
      });

      // Act
      const res = await transmissionClient.listTorrents({
        fields: ['id', 'name'],
      });

      // Assert
      expect(res).toStrictEqual(torrentListWithFields.arguments.torrents);
      expect(requestService.request).toHaveBeenCalledWith(
        JSON.stringify({
          method: 'torrent-get',
          arguments: {
            fields: ['id', 'name'],
          },
        })
      );
    });
    it('requests all fields and applies the provided filters and returns the matching torrents', async () => {
      // Prepare
      const requestService = getDummyRequestService();
      vi.spyOn(requestService, 'request').mockResolvedValue(torrentList);
      const transmissionClient = new TransmissionClient({
        customServices: {
          requestService,
        },
      });

      // Act
      const res = await transmissionClient.listTorrents({
        ids: [1, 2],
      });

      // Assert
      expect(res).toStrictEqual(
        torrentList.arguments.torrents.map((t) => ({
          ...t,
          status: 'DOWNLOADING',
        }))
      );
      expect(requestService.request).toHaveBeenCalledWith(
        JSON.stringify({
          method: 'torrent-get',
          arguments: {
            ids: [1, 2],
            fields: AllTorrentFields,
          },
        })
      );
    });
    it('requests all fields and returns the recently active torrents', async () => {
      // Prepare
      const requestService = getDummyRequestService();
      vi.spyOn(requestService, 'request').mockResolvedValue(
        recentlyActiveTorrentList
      );
      const transmissionClient = new TransmissionClient({
        customServices: {
          requestService,
        },
      });

      // Act
      const res = await transmissionClient.listTorrents({
        ids: 'recently-active',
      });

      // Assert
      expect(res).toStrictEqual(recentlyActiveTorrentList.arguments);
      expect(requestService.request).toHaveBeenCalledWith(
        JSON.stringify({
          method: 'torrent-get',
          arguments: {
            ids: 'recently-active',
            fields: AllTorrentFields,
          },
        })
      );
    });
    it('throws an error when the request is unsuccessful', async () => {
      // Prepare
      const transmissionClient = new TransmissionClient();

      // Act & Assess
      await expect(() =>
        transmissionClient.listTorrents()
      ).rejects.toThrowError(
        'Unable to get torrents from Transmission RPC endpoint'
      );
    });
  });
  describe('Method: addMagnet', () => {
    it('adds a new torrent and returns its data', async () => {
      // Prepare
      const requestService = getDummyRequestService();
      vi.spyOn(requestService, 'request').mockResolvedValue(addNewTorrent);
      const transmissionClient = new TransmissionClient({
        customServices: {
          requestService,
        },
      });

      // Act
      const res = await transmissionClient.addMagnet({ magnet: 'magnet-link' });

      // Assess
      expect(res).toStrictEqual(addNewTorrent.arguments['torrent-added']);
      expect(requestService.request).toHaveBeenCalledWith(
        JSON.stringify({
          method: 'torrent-add',
          arguments: {
            filename: 'magnet-link',
          },
        })
      );
    });
    it('adds a duplicate torrent and returns its data', async () => {
      // Prepare
      const requestService = getDummyRequestService();
      vi.spyOn(requestService, 'request').mockResolvedValue(
        addDuplicateTorrent
      );
      const transmissionClient = new TransmissionClient({
        customServices: {
          requestService,
        },
      });

      // Act
      const res = await transmissionClient.addMagnet({ magnet: 'magnet-link' });

      // Assess
      expect(res).toStrictEqual(
        addDuplicateTorrent.arguments['torrent-duplicate']
      );
      expect(requestService.request).toHaveBeenCalledWith(
        JSON.stringify({
          method: 'torrent-add',
          arguments: {
            filename: 'magnet-link',
          },
        })
      );
    });
    it('throws when the remote returns an invalid response', async () => {
      // Prepare
      const requestService = getDummyRequestService();
      vi.spyOn(requestService, 'request').mockResolvedValue({
        arguments: {
          'torrent-added': undefined,
        },
      });
      const transmissionClient = new TransmissionClient({
        customServices: {
          requestService,
        },
      });

      // Act & Assess
      await expect(() =>
        transmissionClient.addMagnet({
          magnet: 'magnet-link',
          downloadDir: '/',
        })
      ).rejects.toThrowError(
        'Unable to add magnet to Transmission RPC endpoint: magnet-link'
      );
      expect(requestService.request).toHaveBeenCalledWith(
        JSON.stringify({
          method: 'torrent-add',
          arguments: {
            filename: 'magnet-link',
            'download-dir': '/',
          },
        })
      );
    });
  });
});
