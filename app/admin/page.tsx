import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Fetch stats
  const [
    { count: profileCount },
    { count: activityCount },
    { count: videoCount },
    { count: swipeCount },
    { count: matchCount },
    { data: recentProfiles },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('activity_items').select('*', { count: 'exact', head: true }),
    supabase.from('representative_videos').select('*', { count: 'exact', head: true }),
    supabase.from('swipes').select('*', { count: 'exact', head: true }),
    supabase.from('matches').select('*', { count: 'exact', head: true }),
    supabase
      .from('profiles')
      .select('id, first_name, age, city, upload_complete, created_at')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  // Fetch current user's videos
  const { data: myVideos } = await supabase
    .from('representative_videos')
    .select('*')
    .eq('user_id', user.id)
    .order('position')

  // Fetch current user's taste
  const { data: myTaste } = await supabase
    .from('taste_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <AdminClient
      currentUserId={user.id}
      stats={{
        profiles: profileCount || 0,
        activity: activityCount || 0,
        videos: videoCount || 0,
        swipes: swipeCount || 0,
        matches: matchCount || 0,
      }}
      recentProfiles={recentProfiles || []}
      myVideos={myVideos || []}
      myTaste={myTaste}
    />
  )
}
