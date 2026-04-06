'use client'

import { useState } from 'react'
import { DiscoveryUser } from '@/types'
import VideoPlayer from '@/components/VideoPlayer'
import TopicChips from '@/components/TopicChips'
import SwipeControls from '@/components/SwipeControls'
import MatchScreen from '@/components/MatchScreen'

interface Props {
  initialUsers: DiscoveryUser[]
  currentUserId: string
}

export default function DiscoverClient({ initialUsers, currentUserId }: Props) {
  const [users, setUsers] = useState(initialUsers)
  const [videoIndex, setVideoIndex] = useState(0)
  const [matchedUser, setMatchedUser] = useState<DiscoveryUser | null>(null)
  const [swiping, setSwiping] = useState(false)

  const current = users[0]

  if (!current) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="text-5xl">🌊</div>
          <h2 className="text-xl font-bold">You've seen everyone</h2>
          <p className="text-[#888] text-sm">Check back soon.</p>
          <a href="/matches" className="inline-block bg-[#e63462] text-white font-medium py-2.5 px-6 rounded-xl">
            See matches
          </a>
        </div>
      </main>
    )
  }

  async function swipe(decision: 'like' | 'pass') {
    if (swiping) return
    setSwiping(true)

    const response = await fetch('/api/swipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_id: current.profile.id, decision }),
    })

    const data = await response.json()

    if (data.matched) {
      setMatchedUser(current)
    } else {
      advance()
    }

    setSwiping(false)
  }

  function advance() {
    setUsers(u => u.slice(1))
    setVideoIndex(0)
  }

  function dismissMatch() {
    setMatchedUser(null)
    advance()
  }

  const videos = current.videos
  const totalVideos = videos.length
  const currentVideo = videos[videoIndex]

  return (
    <>
      {matchedUser && (
        <MatchScreen user={matchedUser} onDismiss={dismissMatch} />
      )}

      <main className="min-h-screen flex flex-col max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h1 className="text-xl font-bold">
            Vibe<span className="text-[#e63462]">Match</span>
          </h1>
          <a href="/matches" className="text-sm text-[#888] hover:text-[#f5f5f5] transition-colors">
            Matches
          </a>
        </div>

        {/* Person label */}
        <div className="px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-[#888]">
              Person {current.profile.id.slice(-4).toUpperCase()}
            </span>
            <span className="text-sm text-[#555]">
              {current.profile.age} · {current.profile.city}
            </span>
          </div>
        </div>

        {/* Video player */}
        <div className="flex-1 px-4">
          <div className="relative bg-[#141414] rounded-2xl overflow-hidden" style={{ aspectRatio: '9/16', maxHeight: '60vh' }}>
            {currentVideo ? (
              <VideoPlayer
                videoId={currentVideo.youtube_video_id}
                title={currentVideo.title}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-[#555]">
                No video available
              </div>
            )}
          </div>

          {/* Video navigation */}
          {totalVideos > 1 && (
            <div className="flex items-center justify-between mt-3 px-1">
              <button
                onClick={() => setVideoIndex(i => Math.max(0, i - 1))}
                disabled={videoIndex === 0}
                className="text-sm text-[#888] disabled:opacity-30 hover:text-[#f5f5f5] transition-colors"
              >
                ← Prev
              </button>
              <div className="flex gap-1.5">
                {videos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setVideoIndex(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === videoIndex ? 'bg-[#e63462]' : 'bg-[#2a2a2a]'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => setVideoIndex(i => Math.min(totalVideos - 1, i + 1))}
                disabled={videoIndex === totalVideos - 1}
                className="text-sm text-[#888] disabled:opacity-30 hover:text-[#f5f5f5] transition-colors"
              >
                Next →
              </button>
            </div>
          )}

          {/* Video info */}
          {currentVideo && (
            <div className="mt-3 px-1">
              <p className="text-sm font-medium truncate">{currentVideo.title}</p>
              {currentVideo.creator_name && (
                <p className="text-xs text-[#888] mt-0.5">{currentVideo.creator_name}</p>
              )}
            </div>
          )}

          {/* Vibe summary + topics */}
          <div className="mt-4 space-y-2 px-1">
            {current.taste.vibe_summary && (
              <p className="text-sm text-[#aaa] italic">&ldquo;{current.taste.vibe_summary}&rdquo;</p>
            )}
            {current.taste.top_topics.length > 0 && (
              <TopicChips topics={current.taste.top_topics} />
            )}
          </div>
        </div>

        {/* Swipe controls */}
        <div className="px-4 py-6">
          <SwipeControls onLike={() => swipe('like')} onPass={() => swipe('pass')} disabled={swiping} />
          <p className="text-xs text-center text-[#555] mt-3">
            You're evaluating the person's vibe, not just the video
          </p>
        </div>
      </main>
    </>
  )
}
