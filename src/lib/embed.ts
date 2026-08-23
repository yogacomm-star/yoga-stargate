const ALLOWED_EMBED_HOSTS = new Set([
  "www.youtube.com",
  "youtube.com",
  "www.youtube-nocookie.com",
  "youtube-nocookie.com",
  "player.vimeo.com",
]);

export function isAllowedEmbedUrl(url: string): boolean {
  if (!url) return true; // campo facoltativo
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && ALLOWED_EMBED_HOSTS.has(parsed.hostname);
  } catch {
    return false;
  }
}
