// setupTests.js
const catchError = (callback) => {
  try {
    callback();
  } catch (error) {
    return error;
  }
};

/**
 * @type {ExpectExtendMap & MatchersExtend<any>}
 */
const customMatchers = {
  toThrowWithCause(received, cause) {
    const err = catchError(received);
    const passes = err instanceof Error && err.cause === cause;
    const actualCause = String(
      err ? `got: ${err.cause}` : 'no error was thrown'
    );
    console.log('Error Cause', actualCause);

    if (err && err.cause === undefined) {
      console.error('Error was thrown, but cause was undefined. Error:', err);
    }

    return passes
      ? {
          pass: true, // not.toThrowWithCause
          message: () =>
            `Expected callback not to throw an Error with cause '${cause}'`,
        }
      : {
          pass: false, // .toThrowWithCause
          message: () =>
            `Expected callback to throw an Error with cause '${cause}', but ${actualCause}`,
        };
  },
};

expect.extend(customMatchers);
