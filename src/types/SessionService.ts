/**
 * Interface for the SessionService which is used to obtain a session ID from the
 * Transmission RPC endpoint
 */
interface SessionService {
  getSessionId(): Promise<string>;
  resetSessionId(): void;
}

/**
 * The configuration options for the SessionService
 */
type SessionServiceConfig = {
  /**
   * The path to use for all requests
   */
  pathname: string;
  /**
   * The authorization header to use for all requests
   */
  authorization: string;
};

export { SessionService, SessionServiceConfig };
