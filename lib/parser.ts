import { ActivityItem, ParseResult } from '@/types'

const YT_VIDEO_REGEX = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/

function extractVideoId(url: string): string | null {
  const match = url.match(YT_VIDEO_REGEX)
  return match ? match[1] : null
}

function parseJsonFormat(text: string): ParseResult {
  const items: ActivityItem[] = []
  const warnings: string[] = []

  let records: unknown[]
  try {
    records = JSON.parse(text)
    if (!Array.isArray(records)) {
      warnings.push('JSON file is not an array — trying to wrap it.')
      records = [records]
    }
  } catch {
    return { items: [], warnings: ['Could not parse JSON file.'] }
  }

  for (const record of records) {
    if (typeof record !== 'object' || record === null) continue
    const r = record as Record<string, unknown>

    // Google Takeout JSON format
    const titleUrl = (r.titleUrl as string) || ''
    const title = (r.title as string) || ''

    // Strip "Watched " prefix from title
    const cleanTitle = title.startsWith('Watched ') ? title.slice(8) : title

    const videoId = extractVideoId(titleUrl)
    if (!videoId) continue

    let creatorName = ''
    if (Array.isArray(r.subtitles) && r.subtitles.length > 0) {
      const sub = r.subtitles[0] as Record<string, unknown>
      creatorName = (sub.name as string) || ''
    }

    let watchedAt: string | null = null
    if (typeof r.time === 'string') {
      try {
        watchedAt = new Date(r.time).toISOString()
      } catch {
        // ignore bad dates
      }
    }

    items.push({
      title: cleanTitle || `Video ${videoId}`,
      youtube_video_id: videoId,
      canonical_url: `https://www.youtube.com/watch?v=${videoId}`,
      creator_name: creatorName,
      watched_at: watchedAt,
    })
  }

  return { items, warnings }
}

function parseHtmlFormat(text: string): ParseResult {
  const items: ActivityItem[] = []
  const warnings: string[] = []

  // Google Takeout HTML watch-history format
  // Each entry is a <div class="content-cell ..."> block
  const cellRegex = /<div class="content-cell[^"]*mdl-typography--body-1[^"]*">([\s\S]*?)<\/div>/g
  let match

  while ((match = cellRegex.exec(text)) !== null) {
    const cell = match[1]

    // Extract href and title from first anchor (the video link)
    const linkMatch = cell.match(/<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/)
    if (!linkMatch) continue

    const url = linkMatch[1]
    const title = linkMatch[2].trim()

    const videoId = extractVideoId(url)
    if (!videoId) continue

    // Extract channel name from second anchor
    let creatorName = ''
    const links = Array.from(cell.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/g))
    if (links.length >= 2) {
      creatorName = links[1][2].trim()
    }

    // Extract timestamp — appears after the last <br> or as plain text
    let watchedAt: string | null = null
    const timeMatch = cell.match(/(\w+ \d+, \d{4},\s*\d+:\d+:\d+\s*[AP]M\s*\w+)/)
    if (timeMatch) {
      try {
        watchedAt = new Date(timeMatch[1]).toISOString()
      } catch {
        // ignore
      }
    }

    items.push({
      title: title || `Video ${videoId}`,
      youtube_video_id: videoId,
      canonical_url: `https://www.youtube.com/watch?v=${videoId}`,
      creator_name: creatorName,
      watched_at: watchedAt,
    })
  }

  // Fallback: if no cells matched, try simpler link extraction
  if (items.length === 0) {
    warnings.push('Could not parse structured HTML — falling back to link extraction.')
    const hrefs = Array.from(text.matchAll(/href="(https?:\/\/(?:www\.)?youtube\.com\/watch\?[^"]+)"/g))
    for (const h of hrefs) {
      const videoId = extractVideoId(h[1])
      if (videoId && !items.find(i => i.youtube_video_id === videoId)) {
        items.push({
          title: `Video ${videoId}`,
          youtube_video_id: videoId,
          canonical_url: `https://www.youtube.com/watch?v=${videoId}`,
          creator_name: '',
          watched_at: null,
        })
      }
    }
  }

  return { items, warnings }
}

export async function parseYouTubeExport(file: File): Promise<ParseResult> {
  const text = await file.text()

  if (file.name.endsWith('.json') || text.trimStart().startsWith('[') || text.trimStart().startsWith('{')) {
    return parseJsonFormat(text)
  }

  if (text.includes('<!DOCTYPE') || text.includes('<html') || text.includes('<div')) {
    return parseHtmlFormat(text)
  }

  // Try JSON first, then HTML
  const jsonResult = parseJsonFormat(text)
  if (jsonResult.items.length > 0) return jsonResult

  return parseHtmlFormat(text)
}
