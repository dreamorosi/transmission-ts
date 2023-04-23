interface CustomMatchers<R = unknown> {
  toThrowErrorWithCause(cause: string | Error): R;
}

declare namespace Vi {
  /**
   * Extend the `expect` interface with custom matchers, we need to use `any` here because
   * the `Assertion` interface uses it as default type for the `T` generic
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-explicit-any
  interface Assertion<T = any> extends CustomMatchers<T> {}
}
