const torrentList = {
	arguments: {
		torrents: [
			{
				activityDate: 1682285765,
				addedDate: 1682253325,
				comment: '',
				corruptEver: 0,
				creator: '',
				desiredAvailable: 4187471872,
				doneDate: 0,
				downloadDir: '/mnt/vault/torrent-complete',
				downloadLimit: 100,
				downloadLimited: false,
				downloadedEver: 45510045007,
				error: 0,
				errorString: '',
				eta: 10589,
				etaIdle: -1,
				fileStats: [
					{
						bytesCompleted: 8430474116,
						priority: 0,
						wanted: true,
					},
				],
				files: [
					{
						bytesCompleted: 8430474116,
						length: 8430474116,
						name: 'Dummy.txt',
					},
				],
				hashString: '803f75f2673f18365b2123fecaeca5ed70cb11ffa',
				haveUnchecked: 11026432,
				haveValid: 45491421184,
				honorsSessionLimits: true,
				id: 19,
				isFinished: false,
				isPrivate: false,
				isStalled: false,
				labels: [],
				leftUntilDone: 4187471872,
				magnetLink: 'magnet:?xt=urn:abcdefghilmnopqrstuvz',
				manualAnnounceTime: -1,
				maxConnectedPeers: 50,
				metadataPercentComplete: 1,
				name: 'Some Dummy Torrent',
				'peer-limit': 50,
				peers: [
					{
						address: '127.0.0.1',
						clientIsChoked: false,
						clientIsInterested: true,
						clientName: 'qBittorrent 4.5.0',
						flagStr: 'TDEI',
						isDownloadingFrom: true,
						isEncrypted: true,
						isIncoming: true,
						isUTP: true,
						isUploadingTo: false,
						peerIsChoked: true,
						peerIsInterested: false,
						port: 21474,
						progress: 1,
						rateToClient: 194000,
						rateToPeer: 0,
					},
				],
				peersConnected: 1,
				peersFrom: {
					fromCache: 0,
					fromDht: 2,
					fromIncoming: 0,
					fromLpd: 0,
					fromLtep: 0,
					fromPex: 1,
					fromTracker: 2,
				},
				peersGettingFromUs: 1,
				peersSendingToUs: 4,
				percentDone: 0.9157,
				priorities: [0],
				queuePosition: 1,
				rateDownload: 395000,
				rateUpload: 261000,
				recheckProgress: 0,
				secondsDownloading: 34548,
				secondsSeeding: 0,
				seedIdleLimit: 30,
				seedRatioLimit: 0,
				seedRatioMode: 0,
				sizeWhenDone: 49689919488,
				status: 4,
				totalSize: 238368953967,
				trackers: [
					{
						announce: 'udp://tracker.someurl.fake:6969/announce',
						id: 0,
						scrape: 'udp://tracker.someurl.fake:6969/scrape',
						tier: 0,
					},
				],
				uploadRatio: 0.1589,
				uploadedEver: 7234993751,
				wanted: [1],
				webseeds: [],
				webseedsSendingToUs: 0,
			},
		],
	},
	result: 'success',
};

const torrentListWithFields = {
	arguments: {
		torrents: [
			{
				id: 19,
				name: 'Some Dummy Torrent',
			},
		],
	},
	result: 'success',
};

const recentlyActiveTorrentList = {
	arguments: {
		removed: [1, 2],
		torrents: [
			{
				id: 19,
				name: 'Some Dummy Torrent',
			},
		],
	},
	result: 'success',
};

const addNewTorrent = {
	arguments: {
		'torrent-added': {
			hashString: '803f75f2673f18365b2123fecaeca5ed70cb11ffa',
			id: 19,
			name: 'Some Dummy Torrent',
		},
	},
	result: 'success',
};

const addDuplicateTorrent = {
	arguments: {
		'torrent-duplicate': {
			hashString: '803f75f2673f18365b2123fecaeca5ed70cb11ffa',
			id: 19,
			name: 'Some Dummy Torrent',
		},
	},
	result: 'success',
};

const removeTorrent = {
	arguments: {},
	result: 'success',
};

const startTorrent = {
	arguments: {},
	result: 'success',
};

const stopTorrent = {
	arguments: {},
	result: 'success',
};

export {
	torrentList,
	torrentListWithFields,
	recentlyActiveTorrentList,
	addNewTorrent,
	addDuplicateTorrent,
	removeTorrent,
	startTorrent,
	stopTorrent,
};
