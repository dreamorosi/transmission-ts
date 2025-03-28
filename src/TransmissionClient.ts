import type { z } from 'zod';
import { RequestService } from './RequestService.js';
import { AllTorrentFields } from './helpers.js';
import {
	PingResponse,
	RemoveTorrentResponse,
	SessionResponse,
	StartTorrentsResponse,
	StopTorrentsResponse,
	TorrentAddResponse,
	TorrentResponse,
} from './schemas/index.js';
import type {
	AddMagnetOptions,
	GetRecentlyActiveTorrentsConfig,
	GetRecentlyActiveTorrentsOutput,
	RequestService as IRequestService,
	TransmissionClient as ITransmissionClient,
	ListTorrentsConfig,
	ParseResponseOptions,
	ParseResponseOutput,
	RemoveTorrentsConfig,
	Session,
	StartTorrentsConfig,
	StopTorrentsConfig,
	Torrent,
	TorrentAdd,
	TransmissionClientConfig,
} from './types/index.js';

class TransmissionClient implements ITransmissionClient {
	/**
	 * The request service which is used to make requests to the
	 * Transmission RPC endpoint
	 * @default new RequestService()
	 */
	#requestService: IRequestService;

	public constructor(config?: TransmissionClientConfig) {
		this.#requestService =
			config?.customServices?.requestService || new RequestService(config);
	}

	/**
	 * Adds a magnet to the Transmission RPC endpoint
	 *
	 * @example
	 * ```ts
	 * client.addMagnet({
	 *   magnet: 'magnet-link',
	 *   downloadDir: '/path/to/download/dir',
	 *   pause: true,
	 * });
	 * ```
	 *
	 * When `downloadDir` is not specified, Transmission will use the default
	 * download directory as specified in the Transmission daemon's settings.
	 *
	 * By default torrent will be added in a started state, to add it in a paused
	 * state, set `paused` to `true`.
	 *
	 * @param options The magnet to add and any additional options
	 * @returns The info of the torrent that was added
	 */
	public async addMagnet(options: AddMagnetOptions): Promise<TorrentAdd> {
		const { magnet, downloadDir, ...rest } = options;
		try {
			const response = await this.#requestService.request(
				JSON.stringify({
					method: 'torrent-add',
					arguments: {
						filename: magnet,
						...(downloadDir && { 'download-dir': downloadDir }),
						...rest,
					},
				})
			);
			const { arguments: data } = this.parseResponse({
				schema: TorrentAddResponse,
				response,
			});

			// It's safe to typecast here because we know that the response will
			// always be either a 'torrent-added' or 'torrent-duplicate' object
			return (data['torrent-added'] || data['torrent-duplicate']) as TorrentAdd;
		} catch (err) {
			throw new Error(
				`Unable to add magnet to Transmission RPC endpoint: ${magnet}`,
				{
					cause: err,
				}
			);
		}
	}

	/**
	 * Fetch the lists of recently active torrents from the Transmission RPC
	 *
	 * The method returns two lists of torrents, the first called `removed` contains the ids of torrents that were removed,
	 * the second called `torrents` contains the info of the torrents that were added or updated.
	 *
	 * @example
	 * ```ts
	 * const recentlyActiveTorrents = await client.getRecentlyActiveTorrents();
	 * ```
	 *
	 * When getting torrents you can also select which `fields` you want to receive by passing in a list of fields:
	 *
	 * @example
	 * ```ts
	 * const torrents = await client.getRecentlyActiveTorrents({
	 *   fields: ['id', 'name', 'status'],
	 * });
	 * ```
	 *
	 * If no `fields` are specified, all fields will be returned. For a full list of fields see {@link AllTorrentFields}.
	 *
	 * @param config The fields to get for each torrent
	 * @returns The lists of recently active torrents
	 */
	public async getRecentlyActiveTorrents(
		config?: GetRecentlyActiveTorrentsConfig
	): Promise<GetRecentlyActiveTorrentsOutput> {
		try {
			const response = await this.#requestService.request(
				JSON.stringify({
					method: 'torrent-get',
					arguments: {
						ids: 'recently-active',
						fields: config?.fields || AllTorrentFields,
					},
				})
			);
			const { arguments: data } = this.parseResponse({
				schema: TorrentResponse,
				response,
			});

			return data as GetRecentlyActiveTorrentsOutput;
		} catch (err) {
			throw new Error(
				'Unable to get recently active torrents from Transmission RPC endpoint',
				{
					cause: err,
				}
			);
		}
	}

	/**
	 * Gets the current Transmission session, which includes the information
	 * about the Transmission server and the current session.
	 *
	 * @returns The current Transmission session
	 */
	public async getSession(): Promise<Session> {
		try {
			const response = await this.#requestService.request(
				JSON.stringify({
					method: 'session-get',
				})
			);
			const { arguments: data } = this.parseResponse({
				schema: SessionResponse,
				response,
			});

			return data;
		} catch (err) {
			throw new Error(
				'Unable to get session info from Transmission RPC endpoint',
				{
					cause: err,
				}
			);
		}
	}

	/**
	 * Gets a list of torrents from the Transmission RPC endpoint
	 *
	 * If no `ids` are specified, all torrents will be returned.
	 *
	 * @example
	 * ```ts
	 * // List all torrents currently in Transmission
	 * const torrents = await client.listTorrents();
	 * // List torrents with ids 1 and 2
	 * const torrents = await client.listTorrents({
	 *   ids: ['abc', 'def'],
	 * });
	 * ```
	 *
	 * When getting torrents you can also select which `fields` you want to receive by passing in a list of fields:
	 *
	 * @example
	 * ```ts
	 * const torrents = await client.listTorrents({
	 *   fields: ['id', 'name', 'status'],
	 * });
	 * ```
	 *
	 * If no `fields` are specified, all fields will be returned. For a full list of fields see {@link AllTorrentFields}.
	 *
	 * @returns A list of torrents from the Transmission RPC endpoint
	 */
	public async listTorrents(config?: ListTorrentsConfig): Promise<Torrent[]> {
		try {
			const response = await this.#requestService.request(
				JSON.stringify({
					method: 'torrent-get',
					arguments: {
						...(config?.ids && {
							ids: Array.isArray(config.ids) ? config.ids : [config.ids],
						}),
						fields: config?.fields || AllTorrentFields,
					},
				})
			);

			const { arguments: data } = this.parseResponse({
				schema: TorrentResponse,
				response,
			});

			return data.torrents;
		} catch (err) {
			throw new Error('Unable to get torrents from Transmission RPC endpoint', {
				cause: err,
			});
		}
	}

	/**
	 * Pings the Transmission RPC endpoint to ensure it is available.
	 * If the endpoint is not available or the response is not as expected,
	 * an error is thrown.
	 */
	public async ping(): Promise<void> {
		try {
			const response = await this.#requestService.request();
			this.parseResponse({
				schema: PingResponse,
				response,
			});
		} catch (err) {
			throw new Error('Unable to ping the Transmission RPC endpoint', {
				cause: err,
			});
		}
	}

	/**
	 * Remove one or more torrents from the Transmission RPC endpoint
	 *
	 * You can remove torrents by addressing them by their id:
	 *
	 * @example
	 * ```ts
	 * // Remove torrent with id 1
	 * await client.removeTorrents({
	 *   ids: 1,
	 * });
	 * // Remove torrents with ids 1 and 2
	 * await client.removeTorrents({
	 *   ids: [1, 2],
	 * });
	 * // Remove torrent and delete downloaded data
	 * await client.removeTorrents({
	 *   ids: 1,
	 *   deleteLocalData: true,
	 * });
	 * ```
	 *
	 * When removing torrents you can also set the `deleteLocalData` option to true to delete the downloaded data.
	 */
	public async removeTorrents(config: RemoveTorrentsConfig): Promise<void> {
		try {
			const response = await this.#requestService.request(
				JSON.stringify({
					method: 'torrent-remove',
					arguments: {
						ids: Array.isArray(config.ids) ? config.ids : [config.ids],
						'delete-local-data': config?.deleteLocalData || false,
					},
				})
			);
			this.parseResponse({
				schema: RemoveTorrentResponse,
				response,
			});
		} catch (err) {
			throw new Error(
				'Unable to remove torrents from the Transmission RPC endpoint',
				{
					cause: err,
				}
			);
		}
	}

	/**
	 * Starts one or more torrents on the Transmission RPC endpoint
	 *
	 * You can start torrents by addressing them by their hash string:
	 *
	 * @example
	 * ```ts
	 * // Start torrent with hash string 'abc1234567890def1234567890abcdef12345678'
	 * await client.startTorrents({
	 *   ids: 'abc1234567890def1234567890abcdef12345678',
	 * });
	 * // Start torrents with hashes 'abc1234567890def1234567890abcdef12345678' and 'def1234567890abc1234567890abcdef12345678'
	 * await client.startTorrents({
	 *   ids: ['abc1234567890def1234567890abcdef12345678', 'def1234567890abc1234567890abcdef12345678'],
	 * });
	 * ```
	 *
	 * Optionally you can also start the torrents immediately by setting the `now` option to `true`.
	 *
	 * If no `ids` are specified, all torrents will be started.
	 *
	 * @param config Specifies which torrents to start
	 */
	public async startTorrents(config?: StartTorrentsConfig): Promise<void> {
		try {
			const response = await this.#requestService.request(
				JSON.stringify({
					method: config?.now ? 'torrent-start-now' : 'torrent-start',
					arguments: {
						...(config?.ids && {
							ids: Array.isArray(config.ids) ? config.ids : [config.ids],
						}),
					},
				})
			);
			this.parseResponse({
				schema: StartTorrentsResponse,
				response,
			});
		} catch (err) {
			throw new Error(
				'Unable to start torrents in the Transmission RPC endpoint',
				{
					cause: err,
				}
			);
		}
	}

	/**
	 * Stops one or more torrents on the Transmission RPC endpoint
	 *
	 * You can stop torrents by addressing them by their id:
	 *
	 * @example
	 * ```ts
	 * // Stop torrent with id 1
	 * await client.stopTorrents({
	 *   ids: 1,
	 * });
	 * // Stop torrents with ids 1 and 2
	 * await client.stopTorrents({
	 *   ids: [1, 2],
	 * });
	 * ```
	 *
	 * If no `ids` are specified, all torrents will be stopped.
	 *
	 * @param config Specifies which torrents to stop
	 */
	public async stopTorrents(config?: StopTorrentsConfig): Promise<void> {
		try {
			const response = await this.#requestService.request(
				JSON.stringify({
					method: 'torrent-stop',
					arguments: {
						...(config?.ids && {
							ids: Array.isArray(config.ids) ? config.ids : [config.ids],
						}),
					},
				})
			);
			this.parseResponse({
				schema: StopTorrentsResponse,
				response,
			});
		} catch (err) {
			throw new Error(
				'Unable to stop torrents in the Transmission RPC endpoint',
				{
					cause: err,
				}
			);
		}
	}

	/**
	 * @private
	 * Parses the response from the Transmission RPC endpoint using
	 * the provided schema and throws an error if unable to parse the response
	 * or when the response is not as expected.
	 *
	 * @param options Options for parsing the response
	 * @returns The parsed response
	 */
	private parseResponse<GenericSchema extends z.ZodType>(
		options: ParseResponseOptions<GenericSchema>
	): ParseResponseOutput<typeof options.schema> {
		const { schema, response } = options;
		try {
			return schema.parse(response);
		} catch (err) {
			throw new Error(
				'Transmission RPC endpoint returned an invalid response',
				{
					cause: (err as z.ZodError).errors,
				}
			);
		}
	}
}

export { TransmissionClient };
