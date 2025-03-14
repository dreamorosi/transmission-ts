import type { BodyInit } from 'undici';
import type { SessionService } from './SessionService.js';
import type {
	InvalidSessionRetry,
	TransmissionClientConfig,
} from './TransmissionClient.js';

/**
 * Interface for the RequestService which is used to make requests
 */
interface RequestService {
	request(body?: BodyInit): Promise<unknown>;
}

/**
 * The configuration options for the RequestService
 */
interface RequestServiceConfig
	extends Omit<TransmissionClientConfig, 'customServices'> {
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
	};
	/**
	 * The configuration options for retrying a request if the session ID is invalid.
	 * By default, the request will be retried 3 times with a delay of 1 second before
	 * throwing an error.
	 */
	invalidSessionRetryConfig?: Omit<InvalidSessionRetry, 'count'>;
}

export type { RequestService, RequestServiceConfig };
