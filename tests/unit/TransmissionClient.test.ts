import { afterEach, describe, expect, it, vi } from 'vitest';
import { TransmissionClient } from '../../src/TransmissionClient.js';
import { AllTorrentFields } from '../../src/helpers.js';
import { getDummyRequestService, getPingResponse } from '../helpers/index.js';
import { successSession } from '../helpers/responses/index.js';
import {
	addDuplicateTorrent,
	addNewTorrent,
	recentlyActiveTorrentList,
	removeTorrent,
	startTorrent,
	torrentList,
	torrentListWithFields,
} from '../helpers/responses/torrent.js';

afterEach(async () => {
	vi.resetAllMocks();
});

describe('Class: TransmissionClient', () => {
	/* it('test', async () => {
		const transmissionClient = new TransmissionClient({
			username: 'andre',
			password: 'Paccoccap1!',
		});
		// await expect(transmissionClient.ping()).resolves.toEqual(undefined);

		const res = await transmissionClient.listTorrents({ fields: ['name'] });
		expect(res.length).toBe(1);
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
	describe('Method: getRecentlyActiveTorrents', () => {
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
			const res = await transmissionClient.getRecentlyActiveTorrents();

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
		it('requests specific fields when fetching recently active torrents', async () => {
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
			await transmissionClient.getRecentlyActiveTorrents({
				fields: ['id', 'name'],
			});

			// Assert
			expect(requestService.request).toHaveBeenCalledWith(
				JSON.stringify({
					method: 'torrent-get',
					arguments: {
						ids: 'recently-active',
						fields: ['id', 'name'],
					},
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
				transmissionClient.getRecentlyActiveTorrents()
			).rejects.toThrowError(
				'Unable to get recently active torrents from Transmission RPC endpoint'
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
				ids: ['a', 'b'],
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
						ids: ['a', 'b'],
						fields: AllTorrentFields,
					},
				})
			);
		});
		it('requests only the specified torrent when only one id is provided', async () => {
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
				ids: 'a',
			});

			// Assert
			expect(res).toStrictEqual(torrentListWithFields.arguments.torrents);
			expect(requestService.request).toHaveBeenCalledWith(
				JSON.stringify({
					method: 'torrent-get',
					arguments: {
						ids: ['a'],
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
	describe('Method: removeTorrent', () => {
		it('removes the torrent specified when only one id is passed', async () => {
			// Prepare
			const requestService = getDummyRequestService();
			vi.spyOn(requestService, 'request').mockResolvedValue(removeTorrent);
			const transmissionClient = new TransmissionClient({
				customServices: {
					requestService,
				},
			});

			// Act
			await transmissionClient.removeTorrents({ ids: 'a' });

			// Assess
			expect(requestService.request).toHaveBeenCalledWith(
				JSON.stringify({
					method: 'torrent-remove',
					arguments: {
						ids: ['a'],
						'delete-local-data': false,
					},
				})
			);
		});
		it('removes all torrents when only multiple ids are passed', async () => {
			// Prepare
			const requestService = getDummyRequestService();
			vi.spyOn(requestService, 'request').mockResolvedValue(removeTorrent);
			const transmissionClient = new TransmissionClient({
				customServices: {
					requestService,
				},
			});

			// Act
			await transmissionClient.removeTorrents({ ids: ['a', 'b'] });

			// Assess
			expect(requestService.request).toHaveBeenCalledWith(
				JSON.stringify({
					method: 'torrent-remove',
					arguments: {
						ids: ['a', 'b'],
						'delete-local-data': false,
					},
				})
			);
		});
		it('throws when the remote returns an invalid response', async () => {
			// Prepare
			const requestService = getDummyRequestService();
			vi.spyOn(requestService, 'request').mockResolvedValue({
				arguments: {
					'torrent-removed': undefined,
				},
			});
			const transmissionClient = new TransmissionClient({
				customServices: {
					requestService,
				},
			});

			// Act & Assess
			await expect(() =>
				transmissionClient.removeTorrents({
					ids: 'a',
					deleteLocalData: true,
				})
			).rejects.toThrowError(
				'Unable to remove torrents from the Transmission RPC endpoint'
			);
			expect(requestService.request).toHaveBeenCalledWith(
				JSON.stringify({
					method: 'torrent-remove',
					arguments: {
						ids: ['a'],
						'delete-local-data': true,
					},
				})
			);
		});
	});
	describe('Method: startTorrents', () => {
		it('starts all torrents when no id is passed', async () => {
			// Prepare
			const requestService = getDummyRequestService();
			vi.spyOn(requestService, 'request').mockResolvedValue(startTorrent);
			const transmissionClient = new TransmissionClient({
				customServices: {
					requestService,
				},
			});

			// Act
			await transmissionClient.startTorrents();

			// Assert
			expect(requestService.request).toHaveBeenCalledWith(
				JSON.stringify({
					method: 'torrent-start',
					arguments: {},
				})
			);
		});
		it('starts the torrents specified when passing their ids', async () => {
			// Prepare
			const requestService = getDummyRequestService();
			vi.spyOn(requestService, 'request').mockResolvedValue(startTorrent);
			const transmissionClient = new TransmissionClient({
				customServices: {
					requestService,
				},
			});

			// Act
			await transmissionClient.startTorrents({
				ids: ['a', 'b'],
			});

			// Assert
			expect(requestService.request).toHaveBeenCalledWith(
				JSON.stringify({
					method: 'torrent-start',
					arguments: {
						ids: ['a', 'b'],
					},
				})
			);
		});
		it('starts the torrent immediately when requested', async () => {
			// Prepare
			const requestService = getDummyRequestService();
			vi.spyOn(requestService, 'request').mockResolvedValue(startTorrent);
			const transmissionClient = new TransmissionClient({
				customServices: {
					requestService,
				},
			});

			// Act
			await transmissionClient.startTorrents({
				ids: 'a',
				now: true,
			});

			// Assert
			expect(requestService.request).toHaveBeenCalledWith(
				JSON.stringify({
					method: 'torrent-start-now',
					arguments: {
						ids: ['a'],
					},
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
				transmissionClient.startTorrents()
			).rejects.toThrowError(
				'Unable to start torrents in the Transmission RPC endpoint'
			);
		});
	});
	describe('Method: stopTorrents', () => {
		it('stops all torrents when no id is passed', async () => {
			// Prepare
			const requestService = getDummyRequestService();
			vi.spyOn(requestService, 'request').mockResolvedValue(startTorrent);
			const transmissionClient = new TransmissionClient({
				customServices: {
					requestService,
				},
			});

			// Act
			await transmissionClient.stopTorrents();

			// Assert
			expect(requestService.request).toHaveBeenCalledWith(
				JSON.stringify({
					method: 'torrent-stop',
					arguments: {},
				})
			);
		});
		it('stops the torrent specified when passing only one id', async () => {
			// Prepare
			const requestService = getDummyRequestService();
			vi.spyOn(requestService, 'request').mockResolvedValue(startTorrent);
			const transmissionClient = new TransmissionClient({
				customServices: {
					requestService,
				},
			});

			// Act
			await transmissionClient.stopTorrents({
				ids: 'a',
			});

			// Assert
			expect(requestService.request).toHaveBeenCalledWith(
				JSON.stringify({
					method: 'torrent-stop',
					arguments: {
						ids: ['a'],
					},
				})
			);
		});
		it('stops the torrents specified when passing their ids', async () => {
			// Prepare
			const requestService = getDummyRequestService();
			vi.spyOn(requestService, 'request').mockResolvedValue(startTorrent);
			const transmissionClient = new TransmissionClient({
				customServices: {
					requestService,
				},
			});

			// Act
			await transmissionClient.stopTorrents({
				ids: ['a', 'b'],
			});

			// Assert
			expect(requestService.request).toHaveBeenCalledWith(
				JSON.stringify({
					method: 'torrent-stop',
					arguments: {
						ids: ['a', 'b'],
					},
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
				transmissionClient.stopTorrents()
			).rejects.toThrowError(
				'Unable to stop torrents in the Transmission RPC endpoint'
			);
		});
	});
});
