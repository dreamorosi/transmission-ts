# Transmission TS

An opinionated Transmission RPC client for Node.js written in TypeScript 🧲

## Installation

```bash
npm install transmission-ts
```

## Usage

```ts
import { TransmissionClient } from "transmission-ts";

const client = new TransmissionClient();
```

You can also pass in a config object to the constructor to configure the connection to the Transmission RPC server, all of the following are optional:

- `host`: The host of the Transmission RPC server. Defaults to `localhost`.
- `port`: The port of the Transmission RPC server. Defaults to `9091`.
- `protocol`: The protocol of the Transmission RPC server. Defaults to `http`.
- `username`: The username to use for authentication. Defaults to `transmission`.
- `password`: The password to use for authentication. Defaults to `transmission`.
- `path`: The path to the Transmission RPC server. Defaults to `/transmission/rpc`.

### Add a torrent

You can add a torrent by passing in a magnet link

```ts
const torrent = await client.addMagnet({
  magnet: "magnet:?xt=urn:btih:..."
});
```

While adding a torrent you can also pass in any of the following options:

- `downloadDir`: The directory where the downloaded contents will be saved in. Defaults to the default download directory configured in Transmission.
- `paused`: Whether or not the torrent should be added in a paused state. Defaults to `false`.

### List torrents

You can get all torrents or only some of them by specifying a list of ids:

```ts
// List all torrents currently in Transmission
const torrents = await client.getTorrents();
// List torrents with ids 1 and 2
const torrents = await client.getTorrents({
  ids: [1, 2],
});
```

You can also use the `recently-active` keyword to get the most recently active torrents:

```ts
const torrents = await client.getTorrents({
  ids: "recently-active",
});
```

When getting torrents you can also select which fields you want to receive by passing in a list of fields:

```ts
const torrents = await client.getTorrents({
  fields: ["id", "name", "status"],
});
```

A full list of fields can be found in the [API reference](). If you don't pass in any fields, all fields will be returned.

### Remove torrents

You can remove torrents by passing in one or more ids:

```ts
// Remove torrent with id 1
await client.removeTorrents({
  ids: 1,
});
// Remove torrents with ids 1 and 2
await client.removeTorrents({
  ids: [1, 2],
});
// Remove torrent and delete downloaded data
await client.removeTorrents({
  ids: 1,
  deleteLocalData: true,
});
```

When removing torrents you can also specify whether or not you want to delete the downloaded data by setting the `deleteLocalData` option to `true`. Defaults to `false`.
```

When deleting torrents you can also specify whether or not you want to delete the downloaded data by setting the `deleteLocalData` option to `true`. Defaults to `false`.

### Other methods

The following methods are also available:
- `ping()` - Pings the Transmission RPC server, this is useful to check if the remote server is reachable.
- `getSession()` - Gets the current Transmission session information, this includes the Transmission daemon configuration.

For a full list of methods and their options, see the [API reference]().

## License

This project is licensed under the MIT-0 License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome, however please open an issue first to discuss what you would like to change, thanks!

## Notice

This package and the maintainers are not affiliated with the Transmission project in any way. Likewise, the existence of this package nor its open-source nature implies any endorsement towards piracy or download of copyrighted content via any means including but not limited to the usage of this package. Use of this package is entirely at your own risk and responsibility.