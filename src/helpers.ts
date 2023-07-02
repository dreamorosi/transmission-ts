/**
 * Fields that can be used to get torrents from the Transmission RPC endpoint
 *
 * The list aligns with the {@link https://github.com/transmission/transmission/blob/main/docs/rpc-spec.md#33-torrent-accessor-torrent-get Transmission Spec}.
 */
const TorrentField = {
  id: 'id',
  addedDate: 'addedDate',
  creator: 'creator',
  doneDate: 'doneDate',
  comment: 'comment',
  name: 'name',
  totalSize: 'totalSize',
  error: 'error',
  errorString: 'errorString',
  eta: 'eta',
  etaIdle: 'etaIdle',
  isFinished: 'isFinished',
  isStalled: 'isStalled',
  isPrivate: 'isPrivate',
  files: 'files',
  fileStats: 'fileStats',
  hashString: 'hashString',
  leftUntilDone: 'leftUntilDone',
  metadataPercentComplete: 'metadataPercentComplete',
  peers: 'peers',
  peersFrom: 'peersFrom',
  peersConnected: 'peersConnected',
  peersGettingFromUs: 'peersGettingFromUs',
  peersSendingToUs: 'peersSendingToUs',
  percentDone: 'percentDone',
  queuePosition: 'queuePosition',
  rateDownload: 'rateDownload',
  rateUpload: 'rateUpload',
  secondsDownloading: 'secondsDownloading',
  recheckProgress: 'recheckProgress',
  seedRatioMode: 'seedRatioMode',
  seedRatioLimit: 'seedRatioLimit',
  seedIdleLimit: 'seedIdleLimit',
  sizeWhenDone: 'sizeWhenDone',
  status: 'status',
  trackers: 'trackers',
  downloadDir: 'downloadDir',
  downloadLimit: 'downloadLimit',
  downloadLimited: 'downloadLimited',
  uploadedEver: 'uploadedEver',
  downloadedEver: 'downloadedEver',
  corruptEver: 'corruptEver',
  uploadRatio: 'uploadRatio',
  webseedsSendingToUs: 'webseedsSendingToUs',
  haveUnchecked: 'haveUnchecked',
  haveValid: 'haveValid',
  honorsSessionLimits: 'honorsSessionLimits',
  manualAnnounceTime: 'manualAnnounceTime',
  activityDate: 'activityDate',
  desiredAvailable: 'desiredAvailable',
  labels: 'labels',
  magnetLink: 'magnetLink',
  maxConnectedPeers: 'maxConnectedPeers',
  peerLimit: 'peer-limit',
  priorities: 'priorities',
  wanted: 'wanted',
  webseeds: 'webseeds',
} as const;

/**
 * Special variable that contains all possible fields,
 * useful when you want to use all fields or need to
 * iterate over all of them
 */
const AllTorrentFields = Object.values(TorrentField);

/**
 * Status codes mapped to their string representation
 *
 * The status codes align with the {@link https://github.com/transmission/transmission/blob/main/docs/rpc-spec.md#33-torrent-accessor-torrent-get Transmission Spec}.
 */
const Status = {
  0: 'STOPPED',
  1: 'QUEUED_CHECK',
  2: 'CHECKING',
  3: 'QUEUED_DOWNLOAD',
  4: 'DOWNLOADING',
  5: 'QUEUED_SEED',
  6: 'SEEDING',
} as const;

export { TorrentField, AllTorrentFields, Status };
