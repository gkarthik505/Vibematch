import { ActivityItem, RepresentativeVideo } from '@/types'

const TOPIC_KEYWORDS: Record<string, string[]> = {
  comedy: ['funny', 'comedy', 'meme', 'humor', 'laugh', 'joke', 'prank', 'roast', 'stand-up', 'standup', 'sketch'],
  football: ['football', 'soccer', 'goal', 'match', 'premier league', 'champions league', 'fifa', 'nfl', 'nba', 'basketball', 'sport', 'sports', 'game', 'highlights', 'ucl'],
  fitness: ['workout', 'gym', 'fitness', 'exercise', 'training', 'muscle', 'strength', 'cardio', 'yoga', 'weight loss', 'bodybuilding'],
  tech: ['tech', 'programming', 'code', 'software', 'hardware', 'ai', 'machine learning', 'web dev', 'javascript', 'python', 'tutorial', 'developer', 'coding', 'review', 'unboxing', 'computer'],
  gaming: ['gaming', 'game', 'gameplay', 'gamer', 'playthrough', 'walkthrough', 'lets play', 'esport', 'twitch', 'minecraft', 'fortnite', 'valorant', 'stream'],
  music: ['music', 'song', 'official video', 'mv', 'lyrics', 'album', 'playlist', 'concert', 'live performance', 'cover', 'rap', 'hip hop', 'pop', 'rock', 'rnb', 'edm'],
  travel: ['travel', 'vlog', 'visit', 'country', 'city', 'tour', 'adventure', 'trip', 'world', 'explore', 'documentary'],
  food: ['food', 'cook', 'recipe', 'eat', 'restaurant', 'mukbang', 'baking', 'chef', 'meal', 'kitchen', 'dish'],
  news: ['news', 'politics', 'interview', 'debate', 'election', 'president', 'government', 'war', 'economy'],
  education: ['learn', 'education', 'history', 'science', 'math', 'lesson', 'course', 'explained', 'how to', 'why', 'what is'],
  lifestyle: ['lifestyle', 'day in', 'routine', 'productivity', 'morning', 'night', 'habits', 'motivation', 'self improvement'],
  film: ['movie', 'film', 'trailer', 'review', 'series', 'anime', 'netflix', 'episode', 'reaction'],
}

function classifyTopic(title: string, creator: string): string {
  const text = (title + ' ' + creator).toLowerCase()
  let bestTopic = 'other'
  let bestScore = 0

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    const score = keywords.filter(kw => text.includes(kw)).length
    if (score > bestScore) {
      bestScore = score
      bestTopic = topic
    }
  }
  return bestTopic
}

function recencyScore(watchedAt: string | null): number {
  if (!watchedAt) return 0.3
  const now = Date.now()
  const then = new Date(watchedAt).getTime()
  const ageMs = now - then
  const oneYear = 365 * 24 * 60 * 60 * 1000
  // 1.0 for today, ~0.0 for 1 year ago
  return Math.max(0, 1 - ageMs / oneYear)
}

export function selectRepresentativeVideos(items: ActivityItem[]): RepresentativeVideo[] {
  if (items.length === 0) return []

  // Deduplicate by video ID, keeping the most recent watch
  const byVideoId = new Map<string, ActivityItem>()
  for (const item of items) {
    if (!item.youtube_video_id) continue
    const existing = byVideoId.get(item.youtube_video_id)
    if (!existing) {
      byVideoId.set(item.youtube_video_id, item)
    } else if (item.watched_at && (!existing.watched_at || item.watched_at > existing.watched_at)) {
      byVideoId.set(item.youtube_video_id, item)
    }
  }

  const unique = Array.from(byVideoId.values())

  // Count creator frequency
  const creatorCounts = new Map<string, number>()
  for (const item of items) {
    if (item.creator_name) {
      creatorCounts.set(item.creator_name, (creatorCounts.get(item.creator_name) || 0) + 1)
    }
  }
  const maxCreatorCount = Math.max(...Array.from(creatorCounts.values()), 1)

  // Classify topics
  const topicMap = new Map<string, ActivityItem[]>()
  for (const item of unique) {
    const topic = classifyTopic(item.title, item.creator_name)
    if (!topicMap.has(topic)) topicMap.set(topic, [])
    topicMap.get(topic)!.push(item)
  }

  // Count topic frequency in original (non-deduped) list
  const topicCounts = new Map<string, number>()
  for (const item of items) {
    const topic = classifyTopic(item.title, item.creator_name)
    topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1)
  }
  const maxTopicCount = Math.max(...Array.from(topicCounts.values()), 1)

  // Score each unique item
  type ScoredItem = ActivityItem & { score: number; topic: string }
  const scored: ScoredItem[] = unique.map(item => {
    const topic = classifyTopic(item.title, item.creator_name)
    const topicFreq = (topicCounts.get(topic) || 0) / maxTopicCount
    const creatorRepeat = (creatorCounts.get(item.creator_name) || 0) / maxCreatorCount
    const recency = recencyScore(item.watched_at)
    const randomness = Math.random()

    const score =
      recency * 0.3 +
      topicFreq * 0.3 +
      creatorRepeat * 0.2 +
      randomness * 0.2

    return { ...item, score, topic }
  })

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score)

  // Pick top topics (up to 5)
  const sortedTopics = Array.from(topicCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([t]) => t)

  // Pick 2-3 videos per top topic, diverse selection
  const selected: ScoredItem[] = []
  const usedCreators = new Set<string>()

  for (const topic of sortedTopics) {
    if (selected.length >= 12) break
    const candidates = scored.filter(
      s => s.topic === topic && !selected.find(sel => sel.youtube_video_id === s.youtube_video_id)
    )

    let picked = 0
    for (const candidate of candidates) {
      if (picked >= 3) break
      if (selected.length >= 12) break
      // Avoid over-representing one creator
      if (candidate.creator_name && usedCreators.has(candidate.creator_name) && picked === 0) {
        // Allow at most once per creator unless it's the best for this topic
      }
      selected.push(candidate)
      if (candidate.creator_name) usedCreators.add(candidate.creator_name)
      picked++
    }
  }

  // Fill remaining slots from top-scored items if under 8
  if (selected.length < 8) {
    for (const item of scored) {
      if (selected.length >= 8) break
      if (!selected.find(s => s.youtube_video_id === item.youtube_video_id)) {
        selected.push(item)
      }
    }
  }

  // Shuffle slightly for variety
  const final = selected.slice(0, 12)
  for (let i = final.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[final[i], final[j]] = [final[j], final[i]]
  }

  return final.map((item, index) => ({
    youtube_video_id: item.youtube_video_id,
    title: item.title,
    creator_name: item.creator_name,
    score: item.score,
    position: index,
  }))
}
