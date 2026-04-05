import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { target_id: string; decision: 'like' | 'pass' }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { target_id, decision } = body

  if (!target_id || !['like', 'pass'].includes(decision)) {
    return NextResponse.json({ error: 'Invalid swipe data' }, { status: 400 })
  }

  if (target_id === user.id) {
    return NextResponse.json({ error: 'Cannot swipe on yourself' }, { status: 400 })
  }

  // Upsert the swipe (in case of re-swipe)
  const { error: swipeError } = await supabase.from('swipes').upsert({
    swiper_id: user.id,
    target_id,
    decision,
  })

  if (swipeError) {
    console.error('Swipe error:', swipeError)
    return NextResponse.json({ error: 'Failed to record swipe' }, { status: 500 })
  }

  // Check for mutual like
  let matched = false

  if (decision === 'like') {
    const { data: theirSwipe } = await supabase
      .from('swipes')
      .select('decision')
      .eq('swiper_id', target_id)
      .eq('target_id', user.id)
      .eq('decision', 'like')
      .single()

    if (theirSwipe) {
      // It's a match — ensure consistent ordering (smaller UUID first)
      const [user_a, user_b] = [user.id, target_id].sort()

      const { error: matchError } = await supabase.from('matches').upsert({ user_a, user_b })

      if (matchError) {
        console.error('Match error:', matchError)
      } else {
        matched = true
      }
    }
  }

  return NextResponse.json({ success: true, matched })
}
