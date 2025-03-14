import { type BodyInit, fetch, setGlobalOrigin } from 'undici';
import { SessionService } from './SessionService.js';
import type {
	RequestService as IRequestService,
	RequestServiceConfig,
} from './types/RequestService.js';
import type { SessionService as ISessionService } from './types/SessionService.js';
import type { InvalidSessionRetry } from './types/TransmissionClient.js';

class RequestService implements IRequestService {
	/**
	 * The basic auth header which is used for all requests
	 * @example
	 * ```ts
	 * `Basic ${Buffer.from('user:pass').toString('base64')}`
	 * ```
	 */
	readonly #authHeader: string;
	/**
	 * The configuration options for retrying a request if the session ID is invalid.
	 * By default, the request will be retried 3 times with a delay of 1 second before
	 * throwing an error.
	 */
	readonly #invalidSessionRetry: InvalidSessionRetry;
	/**
	 * The pathname to use for all requests
	 * @example
	 * ```ts
	 * '/transmission/rpc'
	 * ```
	 */
	readonly #pathname: string;
	/**
	 * The session service which is used to obtain a session ID from the
	 * Transmission RPC endpoint
	 * @default new SessionService()
	 */
	#sessionService: ISessionService;

	public constructor(config?: RequestServiceConfig) {
		this.#authHeader = `Basic ${Buffer.from(
			`${config?.username || 'transmission'}:${
				config?.password || 'transmission'
			}`
		).toString('base64')}`;

		setGlobalOrigin(
			`${config?.protocol || 'http'}://${
				config?.hostname || 'localhost'
			}:${String(config?.port || 9091)}`
		);

		this.#pathname = config?.pathname || '/transmission/rpc';

		this.#sessionService =
			config?.customServices?.sessionService ||
			new SessionService({
				pathname: this.#pathname,
				authorization: this.#authHeader,
			});

		this.#invalidSessionRetry = {
			count: 0,
			maxRetries:
				config?.invalidSessionRetryConfig?.maxRetries !== undefined
					? config?.invalidSessionRetryConfig?.maxRetries
					: 3,
			delay:
				config?.invalidSessionRetryConfig?.delay !== undefined
					? config?.invalidSessionRetryConfig?.delay
					: 1000,
		};
	}

	/**
	 * Makes a request to the Transmission RPC endpoint. If the session ID is
	 * invalid, it will be reset and the request will be retried for a number of
	 * times with a delay between each retry before throwing an error.
	 *
	 * @param body The body to send to the Transmission RPC endpoint
	 * @returns The response from the Transmission RPC endpoint
	 */
	public async request(body?: BodyInit): Promise<unknown> {
		const response = await fetch(this.#pathname, {
			method: 'POST',
			headers: {
				'X-Transmission-Session-Id': await this.#sessionService.getSessionId(),
				Authorization: this.#authHeader,
			},
			body,
		});
		if (!response.ok) {
			if (
				response.status === 409 &&
				this.#invalidSessionRetry.count < this.#invalidSessionRetry.maxRetries
			) {
				// Session ID has expired, so reset it and try again
				this.#sessionService.resetSessionId();
				this.#invalidSessionRetry.count += 1;
				await new Promise((resolve) =>
					setTimeout(resolve, this.#invalidSessionRetry.delay)
				);

				return this.request(body);
			}
			if (response.status === 409) {
				throw new Error(
					'Transmission RPC endpoint did not return a session ID, max retries exceeded'
				);
			}
			// Reset the retry count for future requests
			this.#invalidSessionRetry.count = 0;
			throw new Error(
				`Transmission RPC endpoint returned status code ${response.status}`
			);
		}
		// Reset the retry count for future requests
		this.#invalidSessionRetry.count = 0;

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
	}
}

export { RequestService };
