export interface Units {
  /**
   * number of bytes in a KB (1000 for kB; 1024 for KiB)
   */
  'memory-bytes': number;
  /**
   * 4 strings: KB/s, MB/s, GB/s, TB/s
   */
  'memory-units': string[];
  /**
   * number of bytes in a KB (1000 for kB; 1024 for KiB)
   */
  'size-bytes': number;
  /**
   * 4 strings: KB/s, MB/s, GB/s, TB/s
   */
  'size-units': string[];
  /**
   * number of bytes in a KB (1000 for kB; 1024 for KiB)
   */
  'speed-bytes': number;
  /**
   * 4 strings: KB/s, MB/s, GB/s, TB/s
   */
  'speed-units': string[];
}

export interface SessionArguments {
  /**
   * max global download speed (KBps)
   */
  'alt-speed-down': number;
  /**
   * true means use the alt speeds
   */
  'alt-speed-enabled': boolean;
  /**
   * when to turn on alt speeds (units: minutes after midnight)
   */
  'alt-speed-time-begin': number;
  /**
   * what day(s) to turn on alt speeds (look at tr_sched_day)
   */
  'alt-speed-time-day': number;
  /**
   * true means the scheduled on/off times are used
   */
  'alt-speed-time-enabled': boolean;
  /**
   * when to turn off alt speeds (units: same)
   */
  'alt-speed-time-end': number;
  /**
   * max global upload speed (KBps)
   */
  'alt-speed-up': number;
  /**
   * true means enabled
   */
  'blocklist-enabled': boolean;
  /**
   * number of rules in the blocklist
   */
  'blocklist-size': number;
  /**
   * location of the blocklist to use for "blocklist-update"
   */
  'blocklist-url': string;
  /**
   * maximum size of the disk cache (MB)
   */
  'cache-size-mb': number;
  /**
   * location of transmission's configuration directory
   */
  'config-dir': string;
  /**
   * true means allow dht in public torrents
   */
  'dht-enabled': boolean;
  /**
   * default path to download torrents
   */
  'download-dir': string;
  'download-dir-free-space': number;
  /**
   * if true, limit how many torrents can be downloaded at once
   */
  'download-queue-enabled': boolean;
  /**
   * max number of torrents to download at once (see download-queue-enabled)
   */
  'download-queue-size': number;
  /**
   * "required", "preferred", "tolerated"
   */
  encryption: string;
  /**
   * torrents we're seeding will be stopped if they're idle for this long
   */
  'idle-seeding-limit': number;
  /**
   * true if the seeding inactivity limit is honored by default
   */
  'idle-seeding-limit-enabled': boolean;
  /**
   * path for incomplete torrents, when enabled
   */
  'incomplete-dir': string;
  /**
   * true means keep torrents in incomplete-dir until done
   */
  'incomplete-dir-enabled': boolean;
  /**
   * true means allow Local Peer Discovery in public torrents
   */
  'lpd-enabled': boolean;
  /**
   * maximum global number of peers
   */
  'peer-limit-global': number;
  /**
   * maximum global number of peers
   */
  'peer-limit-per-torrent': number;
  /**
   * port number
   */
  'peer-port': number;
  /**
   * true means pick a random peer port on launch
   */
  'peer-port-random-on-start': boolean;
  /**
   * true means allow pex in public torrents
   */
  'pex-enabled': boolean;
  /**
   * true means enabled
   */
  'port-forwarding-enabled': boolean;
  /**
   * whether or not to consider idle torrents as stalled
   */
  'queue-stalled-enabled': boolean;
  /**
   * torrents that are idle for N minuets aren't counted toward seed-queue-size or download-queue-size
   */
  'queue-stalled-minutes': number;
  /**
   * true means append ".part" to incomplete files
   */
  'rename-partial-files': boolean;
  /**
   * the current RPC API version
   */
  'rpc-version': number;
  /**
   * the minimum RPC API version supported
   */
  'rpc-version-minimum': number;
  /**
   * whether or not to call the "done" script
   */
  'script-torrent-done-enabled': boolean;
  /**
   * filename of the script to run
   */
  'script-torrent-done-filename': string;
  /**
   * if true, limit how many torrents can be uploaded at once
   */
  'seed-queue-enabled': boolean;
  /**
   * max number of torrents to uploaded at once (see seed-queue-enabled)
   */
  'seed-queue-size': number;
  /**
   * the default seed ratio for torrents to use
   */
  seedRatioLimit: number;
  /**
   * true if seedRatioLimit is honored by default
   */
  seedRatioLimited: boolean;
  /**
   * max global download speed (KBps)
   */
  'speed-limit-down': number;
  /**
   * true means enabled
   */
  'speed-limit-down-enabled': boolean;
  /**
   * max global upload speed (KBps)
   */
  'speed-limit-up': number;
  /**
   * true means enabled
   */
  'speed-limit-up-enabled': boolean;
  /**
   * true means added torrents will be started right away
   */
  'start-added-torrents': boolean;
  /**
   * true means the .torrent file of added torrents will be deleted
   */
  'trash-original-torrent-files': boolean;
  units: Units;
  /**
   * true means allow utp
   */
  'utp-enabled': boolean;
  /**
   * long version string "$version ($revision)"
   */
  version: string;
}
