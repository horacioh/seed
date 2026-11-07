/**
 * Video link handling shared by the commands and node views. Copied from the
 * BlockNote editor (`packages/editor/src/utils.ts` `youtubeParser` and the
 * `submitVideo` / `getVideoIframeSrc` logic in `video.tsx`) so the stored
 * `link` is exactly what BlockNote writes; importing `@shm/editor` would pull
 * Tiptap 2 and the whole BlockNote fork into this package.
 */

/** The 11-character YouTube video id in a watch, share, embed or `/v/` URL, or `false`. */
export function youtubeParser(url: string): string | false {
  const match = url.match(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/)
  return match && match[7]?.length == 11 ? match[7] : false
}

/**
 * The embed link BlockNote stores for a YouTube or Vimeo URL
 * (`https://www.youtube.com/embed/<id>` / `https://player.vimeo.com/video/<id>`),
 * or `null` when the text is not a supported video page URL.
 */
export function videoEmbedLink(url: string): string | null {
  try {
    new URL(url)
  } catch {
    return null
  }
  if (url.includes('youtu.be') || url.includes('youtube')) {
    const id = youtubeParser(url)
    return id ? `https://www.youtube.com/embed/${id}` : null
  }
  if (url.includes('vimeo')) {
    const parts = url.split('/')
    return `https://player.vimeo.com/video/${parts[parts.length - 1]}`
  }
  return null
}

/** Whether a Video block link is a YouTube/Vimeo player (an iframe) rather than a video file. */
export function isVideoPlayerLink(link: string): boolean {
  return /^https:\/\/(www\.youtube\.com\/embed\/|player\.vimeo\.com\/video\/)/.test(link)
}

/** The iframe `src` for a player link; YouTube gets `rel=0` like the BlockNote editor. */
export function videoIframeSrc(link: string): string {
  const url = new URL(link)
  if (!url.host.includes('youtube.com')) return link
  url.searchParams.set('rel', '0')
  return url.toString()
}
