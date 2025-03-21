import type { z } from 'zod';
import type { TorrentField } from '../helpers.js';
import type {
	Base,
	PingResponse as PingResponseSchema,
	Session as SessionSchema,
	TorrentAdd as TorrentAddSchema,
	Torrent as TorrentSchema,
} from '../schemas/index.js';
import type { RequestService } from './RequestService.js';
import type { SessionService } from './SessionService.js';

/**
 * The configuration options for the TransmissionClient
 */
type TransmissionClientConfig = {
	/**
	 * The hostname to use for all requests
	 * @default 'localhost'
	 */
	hostname?: string;
	/**
	 * The port to use for all requests
	 * @default 9091
	 */
	port?: number;
	/**
	 * The pathname to use for all requests
	 * @default '/transmission/rpc'
	 */
	pathname?: string;
	/**
	 * The protocol to use for all requests
	 * @default 'http'
	 */
	protocol?: 'http' | 'https';
	/**
	 * The username to use for all requests
	 * @default 'transmission'
	 */
	username?: string;
	/**
	 * The password to use for all requests
	 * @default 'transmission'
	 */
	password?: string;
	/**
	 * Options for customizing the services used by the TransmissionClient.
	 * This is useful for testing as it allows you to mock the services.
	 */
	customServices?: {
		/**
		 * The session service which is used to obtain a session ID from the
		 * Transmission RPC endpoint
		 * @default new SessionService()
		 */
		sessionService?: SessionService;
		/**
		 * The request service which is used to make requests to the
		 * Transmission RPC endpoint
		 * @default new RequestService()
		 */
		requestService?: RequestService;
	};
};

/**
 * The configuration options for retrying a request if the session ID is invalid
 */
type InvalidSessionRetry = {
	/**
	 * The number of times a request has been retried if the session ID is invalid
	 */
	count: number;
	/**
	 * The delay in milliseconds to wait before retrying a request if the session ID is invalid
	 */
	delay: number;
	/**
	 * The number of times to retry a request if the session ID is invalid
	 */
	maxRetries: number;
};

/**
 * The configuration options for addressing torrents
 */
type TorrentId = string | string[];

/**
 * The configuration options for listing torrents
 */
type ListTorrentsConfig = {
	/**
	 * The hash string or hash strings of the torrents to list
	 * @example '1234567890abcdef1234567890abcdef12345678'
	 */
	ids?: TorrentId;
	fields?: (keyof typeof TorrentField)[];
};

/**
 * The configuration options for when retrieving recently active torrents
 *
 * You can specify the fields to retrieve by setting the `fields` option.
 */
type GetRecentlyActiveTorrentsConfig = {
	/**
	 * The fields to retrieve for each active torrent
	 */
	fields?: (keyof typeof TorrentField)[];
};

/**
 * The output of the listTorrents function when the ids option is set to 'recently-active'
 */
type GetRecentlyActiveTorrentsOutput = {
	removed: number[] | undefined;
	torrents: Torrent[];
};

/**
 * The configuration options for adding a magnet torrent
 */
type AddMagnetOptions = {
	/**
	 * The magnet link to add
	 * @example 'magnet:?xt=urn:btih:...'
	 */
	magnet: string;
	/**
	 * The download directory to use
	 * @example '/home/user/Downloads'
	 */
	downloadDir?: string;
	/**
	 * Whether or not the torrent should be added in a paused state
	 * @default false
	 */
	paused?: boolean;
	/**
	 * The labels to apply to the torrent
	 * @example ['label1', 'label2']
	 * @default []
	 */
	labels?: string[];
};

/**
 * The configuration options for removing torrents
 *
 * You can pass a single ID or an array of IDs to remove multiple torrents.
 * Optionally, you can set the `deleteLocalData` option to `true` to delete the
 * torrent's data from the disk.
 */
type RemoveTorrentsConfig = {
	/**
	 * The ID or IDs of the torrents to remove
	 * @example 'abc1234567890abcdef1234567890abcdef12345678'
	 */
	ids: TorrentId;
	/**
	 * Whether or not to delete the torrent's data
	 * @default false
	 */
	deleteLocalData?: boolean;
};

/**
 * The configuration options for starting one or more torrents
 *
 * You can pass a single ID or an array of IDs to remove multiple torrents.
 * If no IDs are passed, all torrents will be started.
 *
 * Optionally, you can set the `now` option to `true` to start the torrents immediately.
 */
type StartTorrentsConfig = {
	/**
	 * The ID or IDs of the torrents to start
	 * @example 'abc1234567890abcdef1234567890abcdef12345678'
	 */
	ids?: TorrentId;
	/**
	 * Whether or not to start the torrents immediately
	 * @default false
	 */
	now?: boolean;
};

/**
 * The configuration options for stopping one or more torrents
 *
 * You can pass a single ID or an array of IDs to remove multiple torrents.
 * If no IDs are passed, all torrents will be stopped.
 */
type StopTorrentsConfig = {
	/**
	 * The ID or IDs of the torrents to stop
	 * @example 'abc1234567890abcdef1234567890abcdef12345678'
	 */
	ids: TorrentId;
};

/**
 * The options to use when parsing a response
 */
type ParseResponseOptions<GenericSchema extends z.ZodType> = {
	/**
	 * The zod schema to use to parse the response
	 */
	schema: GenericSchema;
	/**
	 * The response to parse
	 */
	response: unknown;
};

/**
 * The output of the parseResponse function
 */
type ParseResponseOutput<T extends z.ZodType> = z.infer<T>;

type BaseResponse = z.infer<typeof Base>;

type Session = z.infer<typeof SessionSchema>;

type PingResponse = z.infer<typeof PingResponseSchema>;

type Torrent = z.infer<typeof TorrentSchema>;

type TorrentAdd = z.infer<typeof TorrentAddSchema>;

interface TransmissionClient {
	getSession: () => Promise<Session>;
	getRecentlyActiveTorrents: (
		config?: GetRecentlyActiveTorrentsConfig
	) => Promise<GetRecentlyActiveTorrentsOutput>;
	listTorrents: (config?: ListTorrentsConfig) => Promise<Torrent[]>;
	ping: () => Promise<void>;
	addMagnet: (options: AddMagnetOptions) => Promise<TorrentAdd>;
	removeTorrents: (config: RemoveTorrentsConfig) => Promise<void>;
}

export type {
	TransmissionClientConfig,
	TransmissionClient,
	InvalidSessionRetry,
	ParseResponseOptions,
	ParseResponseOutput,
	BaseResponse,
	PingResponse,
	Session,
	Torrent,
	ListTorrentsConfig,
	GetRecentlyActiveTorrentsConfig,
	GetRecentlyActiveTorrentsOutput,
	TorrentId,
	TorrentAdd,
	AddMagnetOptions,
	RemoveTorrentsConfig,
	StartTorrentsConfig,
	StopTorrentsConfig,
};
