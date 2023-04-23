import { expect } from 'vitest';

expect.extend({
  /**
   * Custom matcher to check if an error has a given cause
   *
   * @param received Error to match against
   * @param expected Cause to match against, either a `string` or an `Error`
   */
  toThrowErrorWithCause(received, expected) {
    const { isNot } = this;
    const messageSuffix = `Expected to${
      isNot ? ' not' : ''
    } receive an Error with cause '${expected}',`;

    let pass = false;
    // If the received value is not an error, we can't check the cause
    if (!(received instanceof Error)) {
      return {
        pass,
        message: () => `${messageSuffix} but got none`,
        expected: 'an error',
        actual: typeof received,
      };
    }
    const cause = Object(received).hasOwnProperty('cause')
      ? received['cause']
      : undefined;
    // If the error has no cause, we can't check it
    if (cause === undefined) {
      return {
        pass,
        message: () => `${messageSuffix} but got an error without a cause`,
      };
    }
    // If the cause is an error, we check the message, otherwise we check the string
    if (cause instanceof Error) {
      pass = cause.message === expected;
    } else if (typeof cause === 'string') {
      pass = cause === expected;
    }
    const actualCause = cause instanceof Error ? cause.message : cause;

    return {
      pass,
      message: () => `${messageSuffix} but got ${actualCause}`,
      expected,
      actual: actualCause,
    };
  },
});
