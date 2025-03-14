import { z } from 'zod';
import { Base } from './Base.js';

/**
 * @internal
 * Schema for the expected item shape of a session
 */
const Session = z.object({
	'alt-speed-down': z.number(),
	'alt-speed-enabled': z.boolean(),
	'alt-speed-time-begin': z.number(),
	'alt-speed-time-day': z.number(),
	'alt-speed-time-enabled': z.boolean(),
	'alt-speed-time-end': z.number(),
	'alt-speed-up': z.number(),
	'blocklist-enabled': z.boolean(),
	'blocklist-size': z.number(),
	'blocklist-url': z.string(),
	'cache-size-mb': z.number(),
	'config-dir': z.string(),
	'dht-enabled': z.boolean(),
	'download-dir': z.string(),
	'download-dir-free-space': z.number(),
	'download-queue-enabled': z.boolean(),
	'download-queue-size': z.number(),
	encryption: z.string(),
	'idle-seeding-limit': z.number(),
	'idle-seeding-limit-enabled': z.boolean(),
	'incomplete-dir': z.string(),
	'incomplete-dir-enabled': z.boolean(),
	'lpd-enabled': z.boolean(),
	'peer-limit-global': z.number(),
	'peer-limit-per-torrent': z.number(),
	'peer-port': z.number(),
	'peer-port-random-on-start': z.boolean(),
	'pex-enabled': z.boolean(),
	'port-forwarding-enabled': z.boolean(),
	'queue-stalled-enabled': z.boolean(),
	'queue-stalled-minutes': z.number(),
	'rename-partial-files': z.boolean(),
	'rpc-version': z.number(),
	'rpc-version-minimum': z.number(),
	'script-torrent-done-enabled': z.boolean(),
	'script-torrent-done-filename': z.string(),
	'seed-queue-enabled': z.boolean(),
	'seed-queue-size': z.number(),
	seedRatioLimit: z.number(),
	seedRatioLimited: z.boolean(),
	'session-id': z.string(),
	'speed-limit-down': z.number(),
	'speed-limit-down-enabled': z.boolean(),
	'speed-limit-up': z.number(),
	'speed-limit-up-enabled': z.boolean(),
	'start-added-torrents': z.boolean(),
	'trash-original-torrent-files': z.boolean(),
	units: z.object({
		'memory-bytes': z.number(),
		'memory-units': z.array(z.string()),
		'size-bytes': z.number(),
		'size-units': z.array(z.string()),
		'speed-bytes': z.number(),
		'speed-units': z.array(z.string()),
	}),
	'utp-enabled': z.boolean(),
	version: z.string(),
});

/**
 * @internal
 * Schema for the expected response when getting the session
 */
const SessionResponse = Base.extend({
	result: z.literal('success'),
	arguments: Session,
});

export { Session, SessionResponse };
