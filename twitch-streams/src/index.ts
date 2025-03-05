// https://developers.cloudflare.com/workers/
export default {
  async fetch(request, env, ctx): Promise<Response> {
    // validate request
    if ((request.headers.get("User-Agent") || "").includes("bot")) {
      return new Response("bots not allowed", { status: 403 });
    }

    const requestUrl = new URL(request.url);

    if (requestUrl.pathname !== "/") {
      return new Response("Invalid URL", { status: 404 });
    }

    // check cache
    const cacheKey = new Request(requestUrl.toString(), request);
    const cachedResponse = await caches.default.match(cacheKey);

    if (cachedResponse) {
      return cachedResponse;
    }

    // generate new response
    const twitchResponse = await fetchTwitchStreams(
      env.TWITCH_CLIENT_ID,
      env.TWITCH_ACCESS_TOKEN,
    );
    const response = new Response(await twitchResponse.text(), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `public, max-age=${env.CACHE_TTL}`,
      },
    });

    ctx.waitUntil(caches.default.put(cacheKey, response.clone()));
    return response;
  },
} satisfies ExportedHandler<Env>;

// https://dev.twitch.tv/docs/api/reference/#get-streams
async function fetchTwitchStreams(
  clientId: string,
  token: string,
): Promise<Response> {
  const QUAKE_GAME_ID = 7348;
  const url = `https://api.twitch.tv/helix/streams?game_id=${QUAKE_GAME_ID}`;
  const headers = {
    "Client-ID": clientId,
    Authorization: `Bearer ${token}`,
  };
  return await fetch(url, { headers: headers });
}

export interface Env {
  TWITCH_CLIENT_ID: string;
  TWITCH_ACCESS_TOKEN: string;
  CACHE_TTL: number;
}
