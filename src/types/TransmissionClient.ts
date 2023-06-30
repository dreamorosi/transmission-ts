import { z } from 'zod';
import {
  Base,
  PingResponse,
  Session as SessionSchema,
  Torrent as TorrentSchema,
  TorrentAdd as TorrentAddSchema,
} from '../schemas';
import { TorrentField } from '../helpers';
import type { SessionService } from './SessionService';
import type { RequestService } from './RequestService';

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
type TorrentId = number | number[] | string | string[] | 'recently-active';

/**
 * The configuration options for listing torrents
 */
type ListTorrentsConfig<Ids> = {
  ids?: TorrentId & Ids;
  fields?: (keyof typeof TorrentField)[];
};

/**
 * The output of the listTorrents function when the ids option is set to 'recently-active'
 */
type ListTorrentsRecentlyActiveOutput = {
  removed: number[];
  torrents: Torrent[];
};

/**
 * The output of the listTorrents function
 */
type ListTorrentsOutput<Ids extends TorrentId> = Ids extends 'recently-active'
  ? ListTorrentsRecentlyActiveOutput
  : Torrent[];

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
};

/**
 * The output of the parseResponse function
 */
type ParseResponseOutput<T extends z.ZodType> = z.infer<T>;

type BaseResponse = z.infer<typeof Base>;

type Session = z.infer<typeof SessionSchema>;

type PingResponse = z.infer<typeof PingResponse>;

type Torrent = z.infer<typeof TorrentSchema>;

type TorrentAdd = z.infer<typeof TorrentAddSchema>;

interface TransmissionClient {
  getSession: () => Promise<Session>;
  listTorrents: <Ids extends TorrentId>(
    config?: ListTorrentsConfig<Ids>
  ) => Promise<Torrent[]>;
  ping: () => Promise<void>;
  addMagnet: (options: AddMagnetOptions) => Promise<TorrentAdd>;
}

export {
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
  ListTorrentsRecentlyActiveOutput,
  ListTorrentsOutput,
  TorrentId,
  TorrentAdd,
  AddMagnetOptions,
};
