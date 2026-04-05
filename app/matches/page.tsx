import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function MatchesPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Fetch matches where user is user_a or user_b
  const { data: matchesA } = await supabase
    .from('matches')
    .select('*')
    .eq('user_a', user.id)
    .order('created_at', { ascending: false })

  const { data: matchesB } = await supabase
    .from('matches')
    .select('*')
    .eq('user_b', user.id)
    .order('created_at', { ascending: false })

  const allMatches = [...(matchesA || []), ...(matchesB || [])]
  allMatches.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // Get the other user's ID for each match
  const otherIds = allMatches.map(m => (m.user_a === user.id ? m.user_b : m.user_a))

  // Fetch profiles + taste profiles for matched users
  const [{ data: matchedProfiles }, { data: matchedTastes }] = await Promise.all([
    otherIds.length > 0
      ? supabase.from('profiles').select('id, first_name, age, city').in('id', otherIds)
      : Promise.resolve({ data: [] }),
    otherIds.length > 0
      ? supabase.from('taste_profiles').select('user_id, top_topics, vibe_summary').in('user_id', otherIds)
      : Promise.resolve({ data: [] }),
  ])

  return (
    <main className="min-h-screen max-w-md mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your matches</h1>
        <Link href="/discover" className="text-sm text-[#e63462] hover:underline">
          Discover
        </Link>
      </div>

      {allMatches.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <div className="text-5xl">💫</div>
          <h2 className="text-lg font-semibold">No matches yet</h2>
          <p className="text-[#888] text-sm">Keep swiping — someone's vibe will click.</p>
          <Link
            href="/discover"
            className="inline-block bg-[#e63462] text-white font-medium py-2.5 px-6 rounded-xl"
          >
            Start discovering
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {allMatches.map(match => {
            const otherId = match.user_a === user.id ? match.user_b : match.user_a
            const profile = (matchedProfiles || []).find(p => p.id === otherId)
            const taste = (matchedTastes || []).find(t => t.user_id === otherId)

            return (
              <div
                key={match.id}
                className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-lg">
                      {profile?.first_name || 'Someone'}{' '}
                      <span className="text-[#888] font-normal text-base">
                        {profile?.age && `· ${profile.age}`}
                        {profile?.city && ` · ${profile.city}`}
                      </span>
                    </p>
                    <p className="text-xs text-[#555] mt-0.5">
                      Matched {new Date(match.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-2xl">🎉</span>
                </div>

                {taste?.vibe_summary && (
                  <p className="text-sm text-[#aaa] italic">&ldquo;{taste.vibe_summary}&rdquo;</p>
                )}

                {taste?.top_topics && taste.top_topics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {(taste.top_topics as string[]).map(t => (
                      <span
                        key={t}
                        className="text-xs bg-[#1e1e1e] border border-[#2a2a2a] rounded-full px-2.5 py-1 text-[#aaa]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-xs text-[#555]">Chat coming soon</p>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
