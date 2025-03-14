import { MockAgent, setGlobalDispatcher } from 'undici';
import type { Interceptable } from 'undici';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { RequestService } from '../../src/RequestService.js';
import {
	getDummyRequestService,
	getDummySessionService,
	getRequestMatcher,
} from '../helpers/index.js';

let mockAgent: MockAgent;
let mockPool: Interceptable;

beforeEach(() => {
	mockAgent = new MockAgent({
		keepAliveTimeout: 10,
		keepAliveMaxTimeout: 10,
	});
	mockAgent.disableNetConnect();
	setGlobalDispatcher(mockAgent);
	mockPool = mockAgent.get('http://localhost:9091');
});

afterEach(async () => {
	await mockAgent.close();
});

describe('Class: RequestService', () => {
	describe('Method: request', () => {
		it('it makes a request using auth & sessionId, then returns successfully if the remote returns the expected response shape', async () => {
			// Prepare
			mockPool.intercept(getRequestMatcher()).reply(200, { result: 'success' });
			const requestService = getDummyRequestService();

			// Act
			const response = await requestService.request();

			// Act & Assess
			expect(response).toEqual({ result: 'success' });
			expect(mockAgent.assertNoPendingInterceptors()).toBeUndefined();
		});
		it('if sessionId is expired, it retries, then throws if unable multiple times', async () => {
			// Prepare
			mockPool.intercept(getRequestMatcher()).reply(409).times(3); // First request, then 2 retries
			const sessionService = getDummySessionService();
			const requestService = getDummyRequestService(sessionService, {
				maxRetries: 2,
				delay: 0,
			});

			// Act & Assess
			await expect(() => requestService.request()).rejects.toThrowError(
				'Transmission RPC endpoint did not return a session ID, max retries exceeded'
			);
			expect(mockAgent.assertNoPendingInterceptors()).toBeUndefined();
		});
		it('throws if the remote returns a non JSON response', async () => {
			// Prepare
			mockPool.intercept(getRequestMatcher()).reply(200, 'not json');
			const requestService = getDummyRequestService();

			// Act & Assess
			await expect(() => requestService.request()).rejects.toThrowError(
				'Transmission RPC endpoint returned a non JSON response'
			);
			expect(mockAgent.assertNoPendingInterceptors()).toBeUndefined();
		});
		it('throws if the remote is down', async () => {
			// Here we're using the real SessionService, because we want to test the
			// behavior of instantiating a new SessionService when none is provided.
			// This means we need to mock the full request chain, including the
			// sessionId request.

			// Prepare
			mockPool
				.intercept(
					getRequestMatcher({
						addSessionHeader: false,
					})
				)
				.reply(409, {}, { headers: { 'X-Transmission-Session-Id': '123' } })
				.times(1);
			mockPool.intercept(getRequestMatcher()).reply(500);
			const requestService = new RequestService();

			// Act & Assess
			await expect(requestService.request()).rejects.toThrowError(
				'Transmission RPC endpoint returned status code 500'
			);
			expect(mockAgent.assertNoPendingInterceptors()).toBeUndefined();
		});
	});
});
