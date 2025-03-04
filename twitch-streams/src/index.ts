// https://developers.cloudflare.com/workers/
export interface Env {
  TWITCH_CLIENT_ID: string;
  TWITCH_ACCESS_TOKEN: string;
  CACHE_TTL: number;
}

async function fetchQuakeStreams(
  clientId: string,
  token: string,
): Promise<Response> {
  const GAME_ID = 7348; // Quake 1
  const url = `https://api.twitch.tv/helix/streams?game_id=${GAME_ID}`;
  return await fetch(url, {
    headers: {
      "Client-ID": clientId,
      Authorization: `Bearer ${token}`,
    },
  });
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const cache = caches.default;
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    const twitchResponse = await fetchQuakeStreams(
      env.TWITCH_CLIENT_ID,
      env.TWITCH_ACCESS_TOKEN,
    );
    const twitchResponseText = await twitchResponse.text();

    const response = new Response(twitchResponseText, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `public, max-age=${env.CACHE_TTL}`,
      },
    });

    ctx.waitUntil(cache.put(request, response.clone()));
    return response;
  },
} satisfies ExportedHandler<Env>;
