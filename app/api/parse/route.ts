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

    // Select representative videos
    const repVideos = selectRepresentativeVideos(items.slice(0, 1000))

    if (repVideos.length < 3) {
      return NextResponse.json(
        { error: 'We need more data to build your vibe. Your file has too few recognizable YouTube videos.' },
        { status: 400 }
      )
    }

    // Store representative videos
    const videoRows = repVideos.map(v => ({
      user_id: user.id,
      youtube_video_id: v.youtube_video_id,
      title: v.title,
      creator_name: v.creator_name,
      score: v.score,
      position: v.position,
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
