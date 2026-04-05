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

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!myProfile?.onboarding_complete) redirect('/onboarding')

  const { data: mySwipes } = await supabase
    .from('swipes')
    .select('target_id')
    .eq('swiper_id', user.id)

  const swipedIds = (mySwipes || []).map(s => s.target_id)

  let query = supabase
    .from('profiles')
    .select('*')
    .eq('onboarding_complete', true)
    .neq('id', user.id)

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
        </div>
      </main>
    )
  }

  const filtered = profileCandidates.filter(candidate => {
    if (!myProfile.interested_in || myProfile.interested_in === 'everyone') return true
    if (!candidate.gender) return true
    const interestedIn = myProfile.interested_in.toLowerCase()
    const gender = candidate.gender.toLowerCase()
    if (interestedIn === 'men') return gender === 'man'
    if (interestedIn === 'women') return gender === 'woman'
    return true
  })

  if (filtered.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="text-5xl">🎭</div>
          <h2 className="text-xl font-bold">No vibes to discover yet</h2>
          <p className="text-[#888] text-sm">No one matching your preferences has joined yet.</p>
        </div>
      </main>
    )
  }

  const candidateIds = filtered.map(p => p.id)

  const [{ data: allVideos }, { data: allTastes }] = await Promise.all([
    supabase.from('representative_videos').select('*').in('user_id', candidateIds).order('position'),
    supabase.from('taste_profiles').select('*').in('user_id', candidateIds),
  ])

  const discoveryUsers: DiscoveryUser[] = filtered
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
          <p className="text-[#888] text-sm">Other users are still uploading their history.</p>
        </div>
      </main>
    )
  }

  return <DiscoverClient initialUsers={discoveryUsers} currentUserId={user.id} />
}