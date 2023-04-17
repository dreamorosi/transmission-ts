import { fetch, setGlobalOrigin } from 'undici';
import type { BodyInit } from 'undici';
import { z } from 'zod';
import { PingResponse, SessionResponse } from './schemas';
import type {
  TransmissionClient as TransmissionClientInterface,
  TransmissionClientConfig,
  InvalidSessionRetry,
  ParseResponseOptions,
  Session,
  BaseResponse,
  ParseResponseOutput,
} from './types';

class TransmissionClient implements TransmissionClientInterface {
  /**
   * The basic auth header which is used for all requests
   * @example
   * ```ts
   * `Basic ${Buffer.from('user:pass').toString('base64')}`
   * ```
   */
  private readonly basicAuth: string;
  private readonly invalidSessionRetry: InvalidSessionRetry = {
    count: 0,
    delay: 1000,
    maxRetries: 3,
  };
  /**
   * The pathname to use for all requests
   * @example
   * ```ts
   * '/transmission/rpc'
   * ```
   */
  private readonly pathname: string;
  /**
   * The session ID obtained from the Transmission RPC endpoint
   */
  private sessionId?: string;

  public constructor(config?: TransmissionClientConfig) {
    this.basicAuth =
      'Basic ' +
      Buffer.from(
        `${config?.username || 'transmission'}:${
          config?.password || 'transmission'
        }`
      ).toString('base64');

    setGlobalOrigin(
      `${config?.protocol || 'http'}://${
        config?.hostname || 'localhost'
      }:${String(config?.port || 9091)}`
    );

    this.pathname = config?.pathname || '/transmission/rpc';
  }

  public async getSession(): Promise<Session> {
    try {
      const response = await this.request(
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
      throw err;
    }
  }

  /**
   * Pings the Transmission RPC endpoint to ensure it is available.
   * If the endpoint is not available or the response is not as expected,
   * an error is thrown.
   */
  public async ping(): Promise<void> {
    try {
      const response = await this.request();
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
   * Gets the session ID from the Transmission RPC endpoint
   *
   * @returns The session ID
   */
  private async getSessionId(): Promise<string> {
    if (this.sessionId) {
      return this.sessionId;
    }

    try {
      const response = await fetch(this.pathname, {
        method: 'POST',
        headers: {
          Authorization: this.basicAuth,
        },
      });
      const sessionId = response.headers.get('X-Transmission-Session-Id');
      if (!sessionId) {
        throw new Error(
          'Unable to obtain a session ID from the Transmission RPC endpoint',
          {
            cause: response.body,
          }
        );
      }

      this.sessionId = sessionId;

      return sessionId;
    } catch (err) {
      throw err;
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
  private parseResponse<GenericSchema extends BaseResponse>(
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

  /**
   * Makes a request to the Transmission RPC endpoint. If the session ID is
   * invalid, it will be reset and the request will be retried for a number of
   * times with a delay between each retry before throwing an error.
   *
   * @param body The body to send to the Transmission RPC endpoint
   * @returns The response from the Transmission RPC endpoint
   */
  private async request(body?: BodyInit): Promise<unknown> {
    try {
      const response = await fetch(this.pathname, {
        method: 'POST',
        headers: {
          'X-Transmission-Session-Id': await this.getSessionId(),
          Authorization: this.basicAuth,
        },
        body,
      });
      if (!response.ok) {
        if (
          response.status === 409 &&
          this.invalidSessionRetry.count < this.invalidSessionRetry.maxRetries
        ) {
          // Session ID has expired, so reset it and try again
          this.sessionId = undefined;
          this.invalidSessionRetry.count += 1;
          await new Promise((resolve) =>
            setTimeout(resolve, this.invalidSessionRetry.delay)
          );

          return this.request(body);
        }
        if (response.status === 409) {
          throw new Error(
            `Transmission RPC endpoint did not return a session ID, max retries exceeded`
          );
        }
        // Reset the retry count for future requests
        this.invalidSessionRetry.count = 0;
        throw new Error(
          `Transmission RPC endpoint returned status code ${response.status}`
        );
      }
      // Reset the retry count for future requests
      this.invalidSessionRetry.count = 0;

      try {
        const body = await response.json();

        return body;
      } catch (err) {
        throw new Error(
          'Transmission RPC endpoint returned a non JSON response',
          {
            cause: err,
          }
        );
      }
    } catch (err) {
      throw err;
    }
  }
}

export { TransmissionClient };
