import { z } from 'zod';
import { PingResponse, SessionResponse, TorrentResponse } from './schemas';
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
