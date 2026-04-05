import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function DELETE() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Delete all user data in order (cascade would handle most, but be explicit)
  await Promise.all([
    supabase.from('activity_items').delete().eq('user_id', user.id),
    supabase.from('representative_videos').delete().eq('user_id', user.id),
    supabase.from('taste_profiles').delete().eq('user_id', user.id),
    supabase.from('uploaded_files').delete().eq('user_id', user.id),
    supabase.from('swipes').delete().eq('swiper_id', user.id),
    supabase.from('matches').delete().or(`user_a.eq.${user.id},user_b.eq.${user.id}`),
  ])

  // Delete storage files
  const { data: files } = await supabase.storage.from('uploads').list(user.id)
  if (files && files.length > 0) {
    const paths = files.map(f => `${user.id}/${f.name}`)
    await supabase.storage.from('uploads').remove(paths)
  }

  // Delete profile (this should cascade delete the auth user via DB trigger if configured)
  await supabase.from('profiles').delete().eq('id', user.id)

  // Sign out
  await supabase.auth.signOut()

  return NextResponse.json({ success: true })
}
