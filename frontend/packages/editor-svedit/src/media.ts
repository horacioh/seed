/** YouTube video id of a URL, or `false`. Same regex as `youtubeParser` in `@shm/editor` (`utils.ts`). */
export function youtubeParser(url: string): string | false {
  const match = url.match(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/)
  return match && match[7]?.length == 11 ? match[7] : false
}

/**
 * The `link` BlockNote stores for a YouTube or Vimeo URL (`video.tsx`
 * `submitVideo`): `https://www.youtube.com/embed/<id>` or
 * `https://player.vimeo.com/video/<id>`. `null` for anything else, including
 * YouTube URLs without a valid id.
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
  if (url.includes('vimeo')) return `https://player.vimeo.com/video/${url.split('/').at(-1)}`
  return null
}

/** Whether a Video block `link` is a YouTube / Vimeo player rather than a file. */
export function isVideoPlayerLink(link: string): boolean {
  return /^https:\/\/(www\.youtube\.com\/embed\/|player\.vimeo\.com\/video\/)/.test(link)
}

/** The iframe `src` for a player link (`getVideoIframeSrc` in `video.tsx`: no related videos on YouTube). */
export function videoIframeSrc(link: string): string {
  const url = new URL(link)
  if (url.host.includes('youtube.com')) url.searchParams.set('rel', '0')
  return url.toString()
}

/** The HM block type for an uploaded or dropped file. */
export function mediaBlockType(file: {type: string}): 'Image' | 'Video' | 'File' {
  return file.type.startsWith('image/') ? 'Image' : file.type.startsWith('video/') ? 'Video' : 'File'
}

/** Whether an HM attribute flag is on (`true`, or the string `'true'` older documents store). */
export function flag(value: unknown): boolean {
  return value === true || value === 'true'
}
