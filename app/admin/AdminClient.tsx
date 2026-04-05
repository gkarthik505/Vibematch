'use client'

import { useState } from 'react'
import Link from 'next/link'
import { RepresentativeVideo, TasteProfile } from '@/types'

interface Props {
  currentUserId: string
  stats: {
    profiles: number
    activity: number
    videos: number
    swipes: number
    matches: number
  }
  recentProfiles: {
    id: string
    first_name: string
    age: number
    city: string
    upload_complete: boolean
    created_at: string
  }[]
  myVideos: RepresentativeVideo[]
  myTaste: TasteProfile | null
}

export default function AdminClient({ currentUserId, stats, recentProfiles, myVideos, myTaste }: Props) {
  const [seeding, setSeeding] = useState(false)
  const [seedResult, setSeedResult] = useState('')

  async function seedDemoUsers() {
    setSeeding(true)
    setSeedResult('')

    const res = await fetch('/api/admin/seed', { method: 'POST' })
    const data = await res.json()

    setSeedResult(data.message || data.error || 'Done')
    setSeeding(false)
  }

  return (
    <main className="min-h-screen max-w-2xl mx-auto px-4 py-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin</h1>
        <Link href="/discover" className="text-sm text-[#e63462] hover:underline">
          Back to discover
        </Link>
      </div>

      {/* Stats */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Stats</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Object.entries(stats).map(([key, val]) => (
            <div key={key} className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{val}</p>
              <p className="text-xs text-[#888] mt-1 capitalize">{key}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Seed demo users */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Demo data</h2>
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5 space-y-4">
          <p className="text-sm text-[#888]">
            Seed demo users with fake watch histories so you can test discovery.
          </p>
          <button
            onClick={seedDemoUsers}
            disabled={seeding}
            className="bg-[#e63462] hover:bg-[#c4284f] disabled:opacity-50 text-white font-medium py-2.5 px-5 rounded-xl transition-colors"
          >
            {seeding ? 'Seeding...' : 'Seed 5 demo users'}
          </button>
          {seedResult && (
            <p className="text-sm text-[#888]">{seedResult}</p>
          )}
        </div>
      </section>

      {/* My representative videos */}
      <section>
        <h2 className="text-lg font-semibold mb-3">My representative videos</h2>
        {myVideos.length === 0 ? (
          <p className="text-[#888] text-sm">No videos yet. Upload your watch history first.</p>
        ) : (
          <div className="space-y-2">
            {myVideos.map(v => (
              <div key={v.id} className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 flex gap-4">
                <img
                  src={`https://img.youtube.com/vi/${v.youtube_video_id}/mqdefault.jpg`}
                  alt={v.title}
                  className="w-24 h-14 object-cover rounded-lg flex-shrink-0"
                  onError={e => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{v.title}</p>
                  <p className="text-xs text-[#888] mt-0.5">{v.creator_name}</p>
                  <p className="text-xs text-[#555] mt-0.5">Score: {v.score.toFixed(3)} · Position: {v.position}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* My taste profile */}
      {myTaste && (
        <section>
          <h2 className="text-lg font-semibold mb-3">My taste profile</h2>
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5 space-y-3">
            <p className="text-sm text-[#aaa] italic">&ldquo;{myTaste.vibe_summary}&rdquo;</p>
            <div className="flex flex-wrap gap-1.5">
              {(myTaste.top_topics as string[]).map(t => (
                <span key={t} className="text-xs bg-[#1e1e1e] border border-[#2a2a2a] rounded-full px-2.5 py-1 text-[#aaa]">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent users */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Recent users</h2>
        <div className="space-y-2">
          {recentProfiles.map(p => (
            <div key={p.id} className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  {p.first_name}, {p.age} · {p.city}
                  {p.id === currentUserId && <span className="text-xs text-[#e63462] ml-2">(you)</span>}
                </p>
                <p className="text-xs text-[#555]">{new Date(p.created_at).toLocaleDateString()}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${p.upload_complete ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'}`}>
                {p.upload_complete ? 'Active' : 'Pending upload'}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
