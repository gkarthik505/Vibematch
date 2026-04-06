import { createClient } from '@/lib/supabase-server'
import { selectRepresentativeVideos } from '@/lib/video-selector'
import { generateTasteProfile } from '@/lib/taste-profile'
import { ActivityItem } from '@/types'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { items: ActivityItem[]; filePath?: string; warnings?: string[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { items, filePath, warnings = [] } = body

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "We couldn't fully read your file, but we'll try with what we found." }, { status: 400 })
  }

  try {
    // Delete old activity data
    await supabase.from('activity_items').delete().eq('user_id', user.id)
    await supabase.from('representative_videos').delete().eq('user_id', user.id)
    await supabase.from('taste_profiles').delete().eq('user_id', user.id)

    // Store activity items in batches of 500
    const activityRows = items.slice(0, 1000).map(item => ({
      user_id: user.id,
      title: item.title,
      youtube_video_id: item.youtube_video_id,
      canonical_url: item.canonical_url,
      creator_name: item.creator_name,
      watched_at: item.watched_at,
    }))

    for (let i = 0; i < activityRows.length; i += 500) {
      const batch = activityRows.slice(i, i + 500)
      const { error } = await supabase.from('activity_items').insert(batch)
      if (error) {
        console.error('Activity insert error:', error)
      }
    }


// Step 1: Get shortlist of 80 candidates from keyword scoring
const candidates = selectRepresentativeVideos(items.slice(0, 1000))

// Step 2: Fetch YouTube stats for all candidates
const { fetchVideoStats, computeNicheScore } = await import('@/lib/youtube')
const videoIds = candidates.map(v => v.youtube_video_id)

// Fetch in batches of 50 (YouTube API limit)
const allStats = new Map()
for (let i = 0; i < videoIds.length; i += 50) {
  const batch = videoIds.slice(i, i + 50)
  const batchStats = await fetchVideoStats(batch)
  batchStats.forEach((v, k) => allStats.set(k, v))
}

// Step 3: Enrich candidates with API data and re-score
const enriched = candidates
  .map(v => {
    const stats = allStats.get(v.youtube_video_id)
    if (!stats) {
      return {
        ...v,
        keep: true,
        finalScore: v.score * 0.5, // penalise if no API data
        nicheScore: 0.5,
        stats: null,
      }
    }

    // Hard filter: exclude long-form (over 5 minutes, not a short)
    if (stats.durationSeconds > 300 && !stats.isShort) {
      return { ...v, keep: false, finalScore: 0, nicheScore: 0, stats }
    }

    const nicheScore = computeNicheScore(stats.viewCount, stats.channelSubscriberCount)

    // Quality score from API data
    const engagementRate = stats.viewCount > 0
      ? (stats.likeCount + stats.commentCount) / stats.viewCount
      : 0
    const apiQualityScore = Math.min(engagementRate * 10, 1.0)

    // Final score combines keyword score + API signals
    const finalScore =
      v.score * 0.40 +           // keyword/topic score from phase 1
      nicheScore * 0.30 +         // niche signal (views vs subscribers)
      apiQualityScore * 0.20 +    // engagement quality
      (stats.isShort ? 0.10 : 0)  // slight boost for shorts

    return { ...v, keep: true, finalScore, nicheScore, stats }
  })
  .filter(v => v.keep)

// Step 4: Apply final diversity pass on enriched candidates
// Enforce creator and content diversity on the API-enriched pool
const finalCreatorCount = new Map<string, number>()
const finalContentCount = new Map<string, number>()
const finalTopicCount = new Map<string, number>()

const repVideos = enriched
  .sort((a: any, b: any) => b.finalScore - a.finalScore)
  .filter((v: any) => {
    const creator = v.creator_name || ''
    const content = v.score_breakdown?.content_identity || creator
    const topic = v.score_breakdown?.topic || 'other'

    const creatorCount = finalCreatorCount.get(creator) || 0
    const contentCount = finalContentCount.get(content) || 0
    const topicCount = finalTopicCount.get(topic) || 0

    if (creatorCount >= 1) return false
    if (contentCount >= 1) return false
    if (topicCount >= 2) return false

    finalCreatorCount.set(creator, creatorCount + 1)
    finalContentCount.set(content, contentCount + 1)
    finalTopicCount.set(topic, topicCount + 1)
    return true
  })
  .slice(0, 10)

if (repVideos.length < 3) {
  return NextResponse.json(
    { error: 'We need more data to build your vibe.' },
    { status: 400 }
  )
}

// Step 5: Store final videos with full breakdown
const videoRows = (repVideos as any[]).map((v: any, index: number) => ({
  user_id: user.id,
  youtube_video_id: v.youtube_video_id,
  title: v.title,
  creator_name: v.creator_name,
  score: v.finalScore,
  position: index,
  view_count: v.stats?.viewCount || 0,
  subscriber_count: v.stats?.channelSubscriberCount || 0,
  duration_seconds: v.stats?.durationSeconds || 0,
  is_short: v.stats?.isShort || false,
  score_breakdown: {
    topic: (v.score_breakdown as any)?.topic,
    content_type: (v.score_breakdown as any)?.content_type,
    content_identity: (v.score_breakdown as any)?.content_identity,
    keyword_score: Math.round(v.score * 1000) / 1000,
    niche_score: Math.round(v.nicheScore * 1000) / 1000,
    final_score: Math.round(v.finalScore * 1000) / 1000,
    duration_seconds: v.stats?.durationSeconds || 0,
    view_count: v.stats?.viewCount || 0,
    subscriber_count: v.stats?.channelSubscriberCount || 0,
    is_short: v.stats?.isShort || false,
  }
}))

    const { error: videoError } = await supabase.from('representative_videos').insert(videoRows)
    if (videoError) {
      console.error('Video insert error:', videoError)
    }

    // Generate taste profile
    const taste = generateTasteProfile(items)

    const { error: tasteError } = await supabase.from('taste_profiles').upsert({
      user_id: user.id,
      top_topics: taste.top_topics,
      vibe_summary: taste.vibe_summary,
      updated_at: new Date().toISOString(),
    })
    if (tasteError) {
      console.error('Taste profile error:', tasteError)
    }

    // Mark upload complete
    await supabase.from('profiles').update({ upload_complete: true }).eq('id', user.id)

    // Record file upload
    if (filePath) {
      await supabase.from('uploaded_files').insert({
        user_id: user.id,
        file_path: filePath,
        parse_status: 'done',
      })
    }

    return NextResponse.json({
      success: true,
      activityCount: activityRows.length,
      videoCount: repVideos.length,
      warnings,
    })
  } catch (err) {
    console.error('Parse route error:', err)
    return NextResponse.json({ error: 'Processing failed. Please try again.' }, { status: 500 })
  }
}
