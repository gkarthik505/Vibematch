'use client'

import { DiscoveryUser } from '@/types'

interface Props {
  user: DiscoveryUser
  onDismiss: () => void
}

export default function MatchScreen({ user, onDismiss }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm px-4">
      <div className="max-w-sm w-full text-center space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="space-y-1">
          <p className="text-6xl animate-bounce">🎉</p>
          <h2 className="text-3xl font-bold">It's a match!</h2>
          <p className="text-[#888]">
            You and Person {user.profile.id.slice(-4).toUpperCase()} both vibed.
          </p>
        </div>

        <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5 space-y-3 text-left">
          {user.taste.vibe_summary && (
            <p className="text-sm text-[#aaa] italic">&ldquo;{user.taste.vibe_summary}&rdquo;</p>
          )}
          {user.taste.top_topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {user.taste.top_topics.map(t => (
                <span
                  key={t}
                  className="text-xs bg-[#1e1e1e] border border-[#2a2a2a] rounded-full px-2.5 py-1 text-[#aaa]"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#e63462]/10 border border-[#e63462]/30 rounded-xl p-4">
          <p className="text-sm text-[#e63462] font-medium">Chat coming soon</p>
          <p className="text-xs text-[#888] mt-1">
            We'll let you know when messaging is ready.
          </p>
        </div>

        <div className="space-y-3">
          <a
            href="/matches"
            className="block w-full bg-[#e63462] hover:bg-[#c4284f] text-white font-semibold py-3 rounded-xl transition-colors"
          >
            See all matches
          </a>
          <button
            onClick={onDismiss}
            className="block w-full bg-[#141414] hover:bg-[#1e1e1e] border border-[#2a2a2a] text-[#f5f5f5] font-medium py-3 rounded-xl transition-colors"
          >
            Keep discovering
          </button>
        </div>
      </div>
    </div>
  )
}
