import { z } from 'zod';
import {
  PingResponse,
  SessionResponse,
  TorrentResponse,
  TorrentAddResponse,
} from './schemas';
import { AllTorrentFields } from './helpers';
import { RequestService } from './RequestService';
import type {
  TransmissionClient as ITransmissionClient,
  TransmissionClientConfig,
  ParseResponseOptions,
  Session,
  ParseResponseOutput,
  RequestService as IRequestService,
  ListTorrentsConfig,
  TorrentId,
  ListTorrentsOutput,
  TorrentAdd,
  AddMagnetOptions,
} from './types';

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
   * Gets a list of all torrents from the Transmission RPC endpoint
   * @returns A list of all torrents
   */
  public async listTorrents<Ids extends TorrentId>(
    config?: ListTorrentsConfig<Ids>
  ): Promise<ListTorrentsOutput<Ids>> {
    try {
      const response = await this.#requestService.request(
        JSON.stringify({
          method: 'torrent-get',
          arguments: {
            ...(config?.ids && { ids: config.ids }),
            fields: config?.fields || AllTorrentFields,
          },
        })
      );

      const { arguments: data } = this.parseResponse({
        schema: TorrentResponse,
        response,
      });

      if (config?.ids === 'recently-active') {
        return data as ListTorrentsOutput<Ids>;
      } else {
        return data.torrents as ListTorrentsOutput<Ids>;
      }
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
    let parsedResponse;
    try {
      parsedResponse = schema.parse(response);
    } catch (err) {
      throw new Error(
        'Transmission RPC endpoint returned an invalid response',
        {
          cause: (err as z.ZodError).errors,
        }
      );
    }

    return parsedResponse;
  }
}

export { TransmissionClient };
