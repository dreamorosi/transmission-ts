import { z } from 'zod';
import { Session as SessionSchema } from '../schemas/Session';
import { Base, PingResponse } from 'schemas';

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
 * The options to use when parsing a response
 */
type ParseResponseOptions<GenericSchema> = {
  /**
   * The zod schema to use to parse the response
   */
  schema: z.ZodSchema<GenericSchema>;
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

type PingResponse = z.infer<typeof PingResponse>;

interface TransmissionClient {
  getSession: () => Promise<Session>;
}

export {
  TransmissionClientConfig,
  TransmissionClient,
  InvalidSessionRetry,
  ParseResponseOptions,
  ParseResponseOutput,
  BaseResponse,
  Session,
  PingResponse,
};
