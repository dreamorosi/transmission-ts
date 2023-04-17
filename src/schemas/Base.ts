import { z } from 'zod';

const Base = z.object({
  result: z.string(),
  arguments: z.unknown(),
});

const PingResponse = Base.extend({
  result: z.literal('no method name'),
  arguments: z.object({}),
});

export { Base, PingResponse };
