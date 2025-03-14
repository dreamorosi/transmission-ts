interface CustomMatchers<R = unknown> {
	toThrowErrorWithCause(cause: string | Error): R;
}

declare namespace Vi {
	/**
	 * Extend the `expect` interface with custom matchers, we need to use `any` here because
	 * the `Assertion` interface uses it as default type for the `T` generic
	 */
	// biome-ignore lint/suspicious/noExplicitAny: we want to keep this generic
	interface Assertion<T = any> extends CustomMatchers<T> {}
}
