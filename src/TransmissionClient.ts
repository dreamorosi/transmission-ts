import { request } from 'undici';
import type {
  SessionResponse,
  TransmissionClient as TransmissionClientInterface,
} from './types';

class TransmissionClient implements TransmissionClientInterface {
  public constructor() {
    // ...
  }

  public async getSession(): Promise<SessionResponse> {
    try {
      const response = await request(
        {
          hostname: 'localhost',
          port: 9091,
          // url: '/transmission/rpc',
          pathname: '/transmission/rpc',
          protocol: 'http:',
        },
        {
          method: 'POST',
          headers: {
            // 'X-Transmission-Session-Id': '123',
            Authorization:
              'Basic ' + Buffer.from('abc:1234').toString('base64'),
          },
        }
      );
      console.log(response);
    } catch (error) {
      console.log(error);
      throw error;
    }

    return {
      arguments: 'hi',
      result: 'success',
    };
  }
}

export { TransmissionClient };
