/** YouTube video id of a watch / youtu.be / embed URL, or `false` (same parser as `@shm/editor` utils). */
export function youtubeParser(url: string): string | false {
  const match = url.match(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/)
  return match && match[7]?.length === 11 ? match[7] : false
}

/**
 * The player URL BlockNote stores as a Video `link` for a YouTube or Vimeo
 * page URL (`youtube.com/embed/<id>`, `player.vimeo.com/video/<id>`), or null
 * when `url` is not one. Mirrors `submitVideo` in `@shm/editor` `video.tsx`.
 */
export function videoEmbedUrl(url: string): string | null {
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

/** Whether a stored Video link is a YouTube / Vimeo player (rendered as an iframe) rather than a file. */
export function isVideoPlayerLink(link: string): boolean {
  return link.startsWith('https://www.youtube.com/embed/') || link.startsWith('https://player.vimeo.com/video/')
}
