// https://developers.cloudflare.com/workers/
export interface Env {
  YOUTUBE_API_KEY: string;
  CACHE_TTL: number;
}

async function fetchYoutubeStreams(apiKey: string): Promise<Response> {
  // https://developers.google.com/youtube/v3/docs/search/list
  const params = new URLSearchParams({
    // Quake @ https://www.youtube.com/channel/UCA3059HJ1qgueeJx4_lxKJA
    channelId: "UCA3059HJ1qgueeJx4_lxKJA",
    eventType: "live",
    key: apiKey,
    order: "viewCount",
    part: "snippet",
    type: "video",
    videoCategoryId: "20", // Gaming
  });
  const url = `https://www.googleapis.com/youtube/v3/search?${params.toString()}`;
  console.info(url);
  return await fetch(url);
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const cache = caches.default;
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    const youtubeResponse = await fetchYoutubeStreams(env.YOUTUBE_API_KEY);
    const youtubeResponseText = await youtubeResponse.text();

    const response = new Response(youtubeResponseText, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `public, max-age=${env.CACHE_TTL}`,
      },
    });

    ctx.waitUntil(cache.put(request, response.clone()));
    return response;
  },
} satisfies ExportedHandler<Env>;
