// import { SessionArguments } from './Session';

export interface DefaultResponse {
  arguments: unknown;
  result: 'success' | string;
}

export interface SessionResponse extends DefaultResponse {
  arguments: 'hi' | string;
}

interface TransmissionClient {
  getSession: () => Promise<SessionResponse>;
}

export { TransmissionClient };
