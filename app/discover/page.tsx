import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import DiscoverClient from './DiscoverClient'
import { DiscoveryUser } from '@/types'

export default async function DiscoverPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Ensure profile is complete
  const { data: myProfile } = await supabase
    .from('profiles')
    .select('upload_complete, onboarding_complete')
    .eq('id', user.id)
    .single()

  if (!myProfile?.onboarding_complete) redirect('/onboarding')
  if (!myProfile?.upload_complete) redirect('/upload')

  // IDs already swiped on
  const { data: mySwipes } = await supabase
    .from('swipes')
    .select('target_id')
    .eq('swiper_id', user.id)

  const swipedIds = (mySwipes || []).map(s => s.target_id)

  // Find candidates
  let query = supabase.from('profiles').select('*').eq('upload_complete', true).neq('id', user.id)
  if (swipedIds.length > 0) {
    query = query.not('id', 'in', `(${swipedIds.join(',')})`)
  }
  const { data: profileCandidates } = await query.limit(20)

  if (!profileCandidates || profileCandidates.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="text-5xl">🌊</div>
          <h2 className="text-xl font-bold">You've seen everyone</h2>
          <p className="text-[#888] text-sm">Check back soon — new people join every day.</p>
          <a href="/matches" className="inline-block mt-2 bg-[#e63462] text-white font-medium py-2.5 px-6 rounded-xl">
            See your matches
          </a>
        </div>
      </main>
    )
  }

  const candidateIds = profileCandidates.map(p => p.id)

  const [{ data: allVideos }, { data: allTastes }] = await Promise.all([
    supabase.from('representative_videos').select('*').in('user_id', candidateIds).order('position'),
    supabase.from('taste_profiles').select('*').in('user_id', candidateIds),
  ])

  const discoveryUsers: DiscoveryUser[] = profileCandidates
    .map(profile => {
      const videos = (allVideos || []).filter(v => v.user_id === profile.id)
      const taste = (allTastes || []).find(t => t.user_id === profile.id)
      if (videos.length === 0) return null
      return {
        profile,
        videos,
        taste: taste || { top_topics: [], vibe_summary: '' },
      }
    })
    .filter(Boolean) as DiscoveryUser[]

  if (discoveryUsers.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="text-5xl">🎭</div>
          <h2 className="text-xl font-bold">No vibes to discover yet</h2>
          <p className="text-[#888] text-sm">Other users are still uploading their history. Check back soon.</p>
        </div>
      </main>
    )
  }

  return <DiscoverClient initialUsers={discoveryUsers} currentUserId={user.id} />
}
