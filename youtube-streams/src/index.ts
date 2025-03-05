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
    const youtubeResponse = await fetchYoutubeStreams(env.YOUTUBE_API_KEY);
    const response = new Response(await youtubeResponse.text(), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `public, max-age=${env.CACHE_TTL}`,
      },
    });

    ctx.waitUntil(caches.default.put(cacheKey, response.clone()));
    return response;
  },
} satisfies ExportedHandler<Env>;

// https://developers.google.com/youtube/v3/docs/search/list
async function fetchYoutubeStreams(apiKey: string): Promise<Response> {
  // Quake @ https://www.youtube.com/channel/UCA3059HJ1qgueeJx4_lxKJA
  const channelId = "UCA3059HJ1qgueeJx4_lxKJA";
  const params = new URLSearchParams({
    channelId,
    eventType: "live",
    key: apiKey,
    order: "viewCount",
    part: "snippet",
    type: "video",
    videoCategoryId: "20", // Gaming
  });
  const url = `https://www.googleapis.com/youtube/v3/search?${params.toString()}`;
  return await fetch(url);
}

export interface Env {
  YOUTUBE_API_KEY: string;
  CACHE_TTL: number;
}
