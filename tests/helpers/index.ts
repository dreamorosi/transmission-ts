import type { MockInterceptor } from 'undici/types/mock-interceptor';
import type { PingResponse } from '../../src/types';

/**
 * Get the base auth header
 *
 * @example
 * ```ts
 * {
 *   Authorization: Authorization: `Basic ${Buffer.from('transmission:transmission').toString('base64')}`,
 * }
 * ```
 *
 * @param user The username to use
 * @param pass The password to use
 * @returns The auth header
 */
const getBaseAuthHeader = (
  user: string = 'transmission',
  pass: string = 'transmission'
): { Authorization: string } => ({
  Authorization: `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`,
});

/**
 * Get the base session header
 *
 * @example
 * ```ts
 * {
 *  'X-Transmission-Session-Id': '123',
 * }
 * ```
 *
 * @param sessionId The session id to use
 * @returns The session header
 */
const getBaseSessionHeader = (
  sessionId: string = '123'
): { 'X-Transmission-Session-Id': string } => ({
  'X-Transmission-Session-Id': sessionId,
});

interface GetRequestMatcherOptions extends Partial<MockInterceptor.Options> {
  /**
   * Whether to add the default auth header
   * @default true
   */
  addAuthHeader?: boolean;
  /**
   * Whether to add the default session header
   * @default true
   */
  addSessionHeader?: boolean;
}

/**
 * Get a request matcher for the mock interceptor with defaults
 *
 * @example
 * ```ts
 * {
 *   path: '/transmission/rpc',
 *   method: 'POST',
 *   headers: {
 *     Authorization: `Basic ${Buffer.from('transmission:transmission').toString('base64')}`,
 *    'X-Transmission-Session-Id': '123',
 *   },
 * }
 * ```
 *
 * @param options Options to override the defaults
 * @returns The options to pass to the `intercept` method of the mock interceptor
 */
const getRequestMatcher = (
  options: GetRequestMatcherOptions = {}
): MockInterceptor.Options => {
  const { addAuthHeader, addSessionHeader, headers, ...rest } = options;
  const requestMatcher = {
    path: '/transmission/rpc',
    method: 'POST',
    ...rest,
  };

  return {
    ...requestMatcher,
    headers: {
      ...headers,
      ...(addAuthHeader === false ? {} : getBaseAuthHeader()),
      ...(addSessionHeader === false ? {} : getBaseSessionHeader()),
    },
  };
};

/**
 * Get the ping response
 *
 * @example
 * ```ts
 * {
 *   arguments: {},
 *   result: 'no method name',
 * }
 * ```
 *
 * @returns The ping response
 */
const getPingResponse = (): PingResponse => ({
  arguments: {},
  result: 'no method name',
});

export { getBaseAuthHeader, getRequestMatcher, getPingResponse };
