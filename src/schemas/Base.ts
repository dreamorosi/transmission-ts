import { z } from 'zod';

/**
 * @internal
 * Base schema for the expected shape of a response from Transmission
 */
const Base = z.object({
	result: z.string(),
	arguments: z.unknown(),
});

/**
 * @internal
 * Schema for the expected response when pinging Transmission
 */
const PingResponse = Base.extend({
	result: z.literal('no method name'),
	arguments: z.object({}),
});

export { Base, PingResponse };
