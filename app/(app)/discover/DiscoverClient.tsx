'use client'

import { useState } from 'react'
import { DiscoveryUser } from '@/types'
import VideoPlayer from '@/components/VideoPlayer'
import MatchScreen from '@/components/MatchScreen'

interface Props {
  initialUsers: DiscoveryUser[]
  currentUserId: string
}

const DIMENSION_LABELS: Record<string, { label: string; emoji: string }> = {
  humor:     { label: 'Humor',     emoji: '😄' },
  music:     { label: 'Music',     emoji: '🎵' },
  film:      { label: 'Film',      emoji: '🎬' },
  sports:    { label: 'Sports',    emoji: '🏅' },
  tech:      { label: 'Tech',      emoji: '💻' },
  gaming:    { label: 'Gaming',    emoji: '🎮' },
  curiosity: { label: 'Curiosity', emoji: '🔭' },
  lifestyle: { label: 'Lifestyle', emoji: '✨' },
}

function MatchBar({ score }: { score: number }) {
  const color = score >= 70 ? '#639922' : score >= 45 ? '#BA7517' : '#888780'
  return (
    <div style={{ flex: 1, height: 4, background: 'var(--color-background-tertiary, #1f1f1f)', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ width: `${score as number}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.6s ease' }} />
    </div>
  )
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
  const matchScore = (current as any).matchScore

  // Pick top 5 dimensions by score for display
  const topDimensions = matchScore
    ? Object.entries(matchScore.dimensions)
        .sort((a, b) => (b[1] as number) - (a[1] as number))
        .slice(0, 5)
    : []

  return (
    <>
      {matchedUser && (
        <MatchScreen user={matchedUser} onDismiss={dismissMatch} />
      )}

      <main className="min-h-screen flex flex-col max-w-md mx-auto pb-6">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h1 className="text-xl font-bold">
            Vibe<span className="text-[#e63462]">Match</span>
          </h1>
          <a href="/matches" className="text-sm text-[#888] hover:text-[#f5f5f5] transition-colors">
            Matches
          </a>
        </div>

        <div className="px-4 space-y-3">
          {/* Person label + overall match */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-[#ccc]">
                Person {current.profile.id.slice(-4).toUpperCase()}
              </span>
              <span className="text-sm text-[#555] ml-2">
                {current.profile.age && `${current.profile.age} · `}{current.profile.city}
              </span>
            </div>
            {matchScore && (
              <div style={{
                fontSize: 12, fontWeight: 500,
                background: '#EAF3DE', color: '#27500A',
                padding: '3px 10px', borderRadius: 20,
              }}>
                {matchScore.overall}% vibe match
              </div>
            )}
          </div>

          {/* Video player */}
          <div className="relative bg-[#141414] rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
            {currentVideo ? (
              <VideoPlayer videoId={currentVideo.youtube_video_id} title={currentVideo.title} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-[#555]">
                No video available
              </div>
            )}
          </div>

          {/* Video navigation dots */}
          {totalVideos > 1 && (
            <div className="flex items-center justify-between px-1">
              <button
                onClick={() => setVideoIndex(i => Math.max(0, i - 1))}
                disabled={videoIndex === 0}
                className="text-xs text-[#888] disabled:opacity-30 hover:text-white transition-colors"
              >
                ← prev
              </button>
              <div className="flex gap-1.5">
                {videos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setVideoIndex(i)}
                    className={`rounded-full transition-all ${
                      i === videoIndex ? 'bg-[#e63462] w-4 h-1.5' : 'bg-[#2a2a2a] w-1.5 h-1.5'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => setVideoIndex(i => Math.min(totalVideos - 1, i + 1))}
                disabled={videoIndex === totalVideos - 1}
                className="text-xs text-[#888] disabled:opacity-30 hover:text-white transition-colors"
              >
                next →
              </button>
            </div>
          )}

          {/* Video title */}
          {currentVideo && (
            <div>
              <p className="text-sm font-medium text-[#ccc] truncate">{currentVideo.title}</p>
              {currentVideo.creator_name && (
                <p className="text-xs text-[#555] mt-0.5">{currentVideo.creator_name}</p>
              )}
            </div>
          )}

          {/* Vibe summary */}
          {current.taste.vibe_summary && (
            <p className="text-sm text-[#888] italic">
              &ldquo;{current.taste.vibe_summary}&rdquo;
            </p>
          )}

          {/* Conversation starter */}
          {matchScore?.conversationStarter && (
            <div style={{
              background: 'rgba(99, 153, 34, 0.08)',
              border: '0.5px solid rgba(99, 153, 34, 0.25)',
              borderRadius: 12,
              padding: '10px 12px',
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>✦</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#3B6D11', marginBottom: 3 }}>
                  Conversation starter
                </div>
                <div style={{ fontSize: 12, color: '#27500A', lineHeight: 1.5 }}>
                  {matchScore.conversationStarter}
                </div>
              </div>
            </div>
          )}

          {/* Dimension match bars */}
          {matchScore && topDimensions.length > 0 && (
            <div style={{
              background: 'var(--color-background-secondary, #111)',
              border: '0.5px solid var(--color-border-tertiary, #1f1f1f)',
              borderRadius: 12,
              padding: '12px 14px',
            }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                Where your vibes overlap
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {topDimensions.map(([key, score]) => {
                  const dim = DIMENSION_LABELS[key]
                  if (!dim) return null
                  return (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, width: 20, flexShrink: 0 }}>{dim.emoji}</span>
                      <span style={{ fontSize: 12, color: '#888', width: 68, flexShrink: 0 }}>{dim.label}</span>
                      <MatchBar score={score as number} />
                      <span style={{ fontSize: 11, fontWeight: 500, color: '#666', minWidth: 30, textAlign: 'right' }}>
                        {score as number}%
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Shared + their topics */}
          {matchScore && (matchScore.sharedTopics.length > 0 || matchScore.theirTopics.length > 0) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {matchScore.sharedTopics.map((topic: string) => (
                <span key={topic} style={{
                  fontSize: 11, fontWeight: 500,
                  background: '#EAF3DE', color: '#27500A',
                  padding: '4px 10px', borderRadius: 20,
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#639922', display: 'inline-block' }} />
                  {topic}
                </span>
              ))}
              {matchScore.theirTopics.map((topic: string) => (
                <span key={topic} style={{
                  fontSize: 11, fontWeight: 500,
                  background: '#1a1a1a', color: '#666',
                  border: '0.5px solid #2a2a2a',
                  padding: '4px 10px', borderRadius: 20,
                }}>
                  {topic}
                </span>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button
              onClick={() => swipe('pass')}
              disabled={swiping}
              style={{
                flex: 1, padding: '11px 0',
                borderRadius: 12, fontSize: 13, fontWeight: 500,
                border: '0.5px solid #2a2a2a',
                background: 'transparent', color: '#888',
                cursor: swiping ? 'not-allowed' : 'pointer',
                opacity: swiping ? 0.5 : 1,
              }}
            >
              👎 Pass
            </button>
            <button
              onClick={() => swipe('like')}
              disabled={swiping}
              style={{
                flex: 1, padding: '11px 0',
                borderRadius: 12, fontSize: 13, fontWeight: 500,
                border: '0.5px solid rgba(99,153,34,0.4)',
                background: 'rgba(99,153,34,0.08)', color: '#3B6D11',
                cursor: swiping ? 'not-allowed' : 'pointer',
                opacity: swiping ? 0.5 : 1,
              }}
            >
              👍 Like their vibe
            </button>
          </div>

          <p style={{ fontSize: 11, textAlign: 'center', color: '#444' }}>
            You're evaluating the person's vibe, not just the video
          </p>
        </div>
      </main>
    </>
  )
}