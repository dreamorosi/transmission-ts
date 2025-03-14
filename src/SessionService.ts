import { fetch } from 'undici';
import type {
	SessionService as ISessionService,
	SessionServiceConfig,
} from './types/SessionService.js';

/**
 * The session service which is used to obtain a session ID from the
 * Transmission RPC endpoint
 */
class SessionService implements ISessionService {
	/**
	 * The authorization header which is used for all requests
	 */
	#authorization: string;
	/**
	 * The pathname to use for all requests
	 */
	#pathname: string;
	/**
	 * The session ID obtained from the Transmission RPC endpoint
	 */
	#sessionId?: string;

	public constructor(config: SessionServiceConfig) {
		this.#authorization = config.authorization;
		this.#pathname = config.pathname;
	}
	/**
	 * Gets the session ID from the Transmission RPC endpoint
	 *
	 * @returns The session ID
	 */
	public async getSessionId(): Promise<string> {
		if (this.#sessionId) {
			return this.#sessionId;
		}

		const response = await fetch(this.#pathname, {
			method: 'POST',
			headers: {
				Authorization: this.#authorization,
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

		this.#sessionId = sessionId;

		return sessionId;
	}

	/**
	 * Resets the session ID so that it will be obtained again from the
	 * Transmission RPC endpoint on the next request
	 */
	public resetSessionId(): void {
		this.#sessionId = undefined;
	}
}

export { SessionService };
