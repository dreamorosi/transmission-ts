import { describe, it, expect } from 'vitest';
import { TransmissionClient } from '../../src/TransmissionClient';

describe('Class: TransmissionClient', () => {
  it('should be defined', () => {
    expect(TransmissionClient).toBeDefined();
  });

  describe('Method: getSession', () => {
    it('makes a request to the Transmission RPC endpoint', async () => {
      // Prepare
      const transmissionClient = new TransmissionClient();

      // Act
      const res = await transmissionClient.getSession();

      // Assert
      expect(res).toStrictEqual({
        arguments: 'hi',
        result: 'success',
      });
    });
  });
});
