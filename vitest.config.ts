/// <reference types="vitest" />

import { coverageConfigDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'node',
		include: ['tests/**/*.test.{ts,mts}'],
		testTimeout: 10000,
		coverage: {
			provider: 'v8',
			thresholds: {
				statements: 100,
				branches: 100,
				functions: 100,
				lines: 100,
			},
			exclude: [
				...coverageConfigDefaults.exclude,
				'./api/**/*',
				'./src/types/*',
				'./src/index.ts',
			],
		},
		setupFiles: './tests/helpers/customMatchers.ts',
	},
});
