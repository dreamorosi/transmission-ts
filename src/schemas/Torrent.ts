import { z } from 'zod';
import { Base } from './Base';
import { Status } from '../helpers';

/**
 * Gets the string representation of a status code
 *
 * @param statusCode The numerical status code to get the string representation of
 * @returns The string representation of the status code
 */
const getStatus = (
  statusCode: keyof typeof Status | number | undefined
): (typeof Status)[keyof typeof Status] | undefined => {
  const key = statusCode as keyof typeof Status;

  return Status[key];
};

/**
 * @internal
 * Schema for the expected item shape of a torrent
 */
const Torrent = z.object({
  activityDate: z.number().optional(),
  addedDate: z.number().optional(),
  comment: z.string().optional(),
  corruptEver: z.number().optional(),
  creator: z.string().optional(),
  desiredAvailable: z.number().optional(),
  doneDate: z.number().optional(),
  downloadDir: z.string().optional(),
  downloadLimit: z.number().optional(),
  downloadLimited: z.boolean().optional(),
  downloadedEver: z.number().optional(),
  error: z.number().optional(),
  errorString: z.string().optional(),
  eta: z.number().optional(),
  etaIdle: z.number().optional(),
  fileStats: z
    .array(
      z.object({
        bytesCompleted: z.number(),
        priority: z.number(),
        wanted: z.boolean(),
      })
    )
    .optional(),
  files: z
    .array(
      z.object({
        bytesCompleted: z.number(),
        length: z.number(),
        name: z.string(),
      })
    )
    .optional(),
  hashString: z.string().optional(),
  haveUnchecked: z.number().optional(),
  haveValid: z.number().optional(),
  honorsSessionLimits: z.boolean().optional(),
  id: z.number(),
  isFinished: z.boolean().optional(),
  isPrivate: z.boolean().optional(),
  isStalled: z.boolean().optional(),
  labels: z.array(z.unknown()).optional(),
  leftUntilDone: z.number().optional(),
  magnetLink: z.string().optional(),
  manualAnnounceTime: z.number().optional(),
  maxConnectedPeers: z.number().optional(),
  metadataPercentComplete: z.number().optional(),
  name: z.string().optional(),
  'peer-limit': z.number().optional(),
  peers: z.array(z.unknown()).optional(),
  peersConnected: z.number().optional(),
  peersFrom: z
    .object({
      fromCache: z.number(),
      fromDht: z.number(),
      fromIncoming: z.number(),
      fromLpd: z.number(),
      fromLtep: z.number(),
      fromPex: z.number(),
      fromTracker: z.number(),
    })
    .optional(),
  peersGettingFromUs: z.number().optional(),
  peersSendingToUs: z.number().optional(),
  percentDone: z.number().optional(),
  priorities: z.array(z.number()).optional(),
  queuePosition: z.number().optional(),
  rateDownload: z.number().optional(),
  rateUpload: z.number().optional(),
  recheckProgress: z.number().optional(),
  secondsDownloading: z.number().optional(),
  secondsSeeding: z.number().optional(),
  seedIdleLimit: z.number().optional(),
  seedRatioLimit: z.number().optional(),
  seedRatioMode: z.number().optional(),
  sizeWhenDone: z.number().optional(),
  status: z.number().transform(getStatus).optional(),
  totalSize: z.number().optional(),
  trackers: z
    .array(
      z.object({
        announce: z.string(),
        id: z.number(),
        scrape: z.string(),
        tier: z.number(),
      })
    )
    .optional(),
  uploadRatio: z.number().optional(),
  uploadedEver: z.number().optional(),
  wanted: z.array(z.number()).optional(),
  webseeds: z.array(z.string()).optional(),
  webseedsSendingToUs: z.number().optional(),
});

/**
 * @internal
 * Schema for the expected response when getting recently active torrents
 */
const TorrentResponse = Base.extend({
  result: z.literal('success'),
  arguments: z.object({
    removed: z.array(z.number()).optional(),
    torrents: z.array(Torrent),
  }),
});

/**
 * @internal
 * Schema for the expected item shape when adding a torrent,
 * see {@link TorrentAddResponse}.
 */
const TorrentAdd = z.object({
  hashString: z.string(),
  id: z.number(),
  name: z.string(),
});

/**
 * @internal
 * Schema for the expected response when adding a torrent
 */
const TorrentAddResponse = Base.extend({
  result: z.literal('success'),
  arguments: z.record(
    z.literal('torrent-added').or(z.literal('torrent-duplicate')),
    TorrentAdd
  ),
});

/**
 * @internal
 * Schema for the expected response when removing one or more torrents
 */
const RemoveTorrentResponse = Base.extend({
  result: z.literal('success'),
  arguments: z.object({}),
});

export {
  Torrent,
  TorrentResponse,
  TorrentAdd,
  TorrentAddResponse,
  RemoveTorrentResponse,
};
