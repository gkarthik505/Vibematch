const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

interface VideoStats {
  videoId: string
  viewCount: number
  likeCount: number
  commentCount: number
  durationSeconds: number
  channelSubscriberCount: number
  isShort: boolean
}

function parseDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  const hours = parseInt(match[1] || '0')
  const minutes = parseInt(match[2] || '0')
  const seconds = parseInt(match[3] || '0')
  return hours * 3600 + minutes * 60 + seconds
}

export async function fetchVideoStats(videoIds: string[]): Promise<Map<string, VideoStats>> {
  const results = new Map<string, VideoStats>()
  if (!YOUTUBE_API_KEY || videoIds.length === 0) return results

  try {
    const videoRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?` +
      `part=statistics,contentDetails,snippet&` +
      `id=${videoIds.join(',')}&` +
      `key=${YOUTUBE_API_KEY}`
    )
    const videoData = await videoRes.json()
    if (!videoData.items) return results

    const channelIds = [...new Set(videoData.items.map((v: any) => v.snippet.channelId))] as string[]

    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?` +
      `part=statistics&` +
      `id=${channelIds.join(',')}&` +
      `key=${YOUTUBE_API_KEY}`
    )
    const channelData = await channelRes.json()

    const channelStats = new Map<string, number>()
    for (const channel of (channelData.items || [])) {
      channelStats.set(
        channel.id,
        parseInt(channel.statistics?.subscriberCount || '0')
      )
    }

    for (const video of videoData.items) {
      const durationSeconds = parseDuration(video.contentDetails?.duration || '')
      const viewCount = parseInt(video.statistics?.viewCount || '0')
      const channelId = video.snippet?.channelId || ''
      const subscriberCount = channelStats.get(channelId) || 0
      const isShort = durationSeconds <= 60

      results.set(video.id, {
        videoId: video.id,
        viewCount,
        likeCount: parseInt(video.statistics?.likeCount || '0'),
        commentCount: parseInt(video.statistics?.commentCount || '0'),
        durationSeconds,
        channelSubscriberCount: subscriberCount,
        isShort,
      })
    }
  } catch (err) {
    console.error('YouTube API error:', err)
  }

  return results
}

export function computeNicheScore(viewCount: number, subscriberCount: number): number {
  if (subscriberCount === 0) return 0.5
  const ratio = viewCount / subscriberCount
  if (ratio < 0.05) return 1.0
  if (ratio < 0.2)  return 0.8
  if (ratio < 0.5)  return 0.6
  if (ratio < 2.0)  return 0.4
  if (ratio < 10.0) return 0.2
  return 0.1
}