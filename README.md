# quake.world-cloudflare-workers

> Cloudflare workers used by Quake.World

## Workers

| name                                     | description                     | production url                                        | cache ttl  |
|------------------------------------------|---------------------------------|-------------------------------------------------------|------------|
| [**twitch-streams**](./twitch-streams)   | List Quake streams from Twitch  | :link: https://twitch-streams.quakeworld.workers.dev  | 30 seconds |
| [**youtube-streams**](./youtube-streams) | List Quake streams from YouTube | :link: https://youtube-streams.quakeworld.workers.dev | 3 minutes  |

## Development

* [Cloudflare Worker Docs](https://developers.cloudflare.com/workers/)
* [wrangler](https://developers.cloudflare.com/workers/wrangler/) - Cloudflare Developer Platform CLI
