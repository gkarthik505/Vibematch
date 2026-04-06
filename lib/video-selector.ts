import { ActivityItem, RepresentativeVideo } from '@/types'

const TOPIC_KEYWORDS: Record<string, string[]> = {
  comedy: ['funny', 'comedy', 'meme', 'humor', 'laugh', 'joke', 'prank', 'roast', 'stand-up', 'standup', 'sketch', 'parody', 'satire', 'viral', 'compilation'],
  cricket: ['cricket', 'ipl', 'bcci', 'test match', 'odi', 't20', 'wicket', 'batting', 'bowling', 'rohit', 'kohli', 'dhoni', 'bumrah', 'rcb', 'csk', 'mi ', 'kkr', 'srh', 'dc ', 'pbks'],
  football: ['football', 'soccer', 'goal', 'premier league', 'champions league', 'fifa', 'bundesliga', 'la liga', 'serie a', 'messi', 'ronaldo', 'neymar', 'ucl', 'epl', 'transfer'],
  basketball: ['nba', 'basketball', 'lebron', 'curry', 'lakers', 'celtics', 'dunk', 'three pointer', 'playoffs'],
  fitness: ['workout', 'gym', 'fitness', 'exercise', 'training', 'muscle', 'strength', 'cardio', 'yoga', 'weight loss', 'bodybuilding', 'calisthenics', 'crossfit', 'running', 'diet', 'nutrition'],
  tech: ['tech', 'programming', 'code', 'software', 'hardware', 'ai', 'machine learning', 'web dev', 'javascript', 'python', 'tutorial', 'developer', 'coding', 'computer', 'iphone', 'android', 'startup', 'saas'],
  gaming: ['gaming', 'gameplay', 'gamer', 'playthrough', 'walkthrough', 'lets play', 'esport', 'twitch', 'minecraft', 'fortnite', 'valorant', 'stream', 'gta', 'cod', 'pubg', 'bgmi', 'free fire'],
  music: ['music', 'song', 'official video', 'mv', 'lyrics', 'album', 'playlist', 'concert', 'live performance', 'cover', 'rap', 'hip hop', 'pop', 'rock', 'rnb', 'edm', 'lofi', 'beats', 'audio'],
  bollywood: ['bollywood', 'hindi', 'indian movie', 'shah rukh', 'salman', 'aamir', 'deepika', 'ranveer', 'hrithik', 'karan johar', 'dharma', 'yrf', 'filmi', 'desi'],
  travel: ['travel', 'vlog', 'visit', 'country', 'city', 'tour', 'adventure', 'trip', 'world', 'explore', 'backpack', 'itinerary', 'hotel', 'flight', 'solo travel'],
  food: ['food', 'cook', 'recipe', 'eat', 'restaurant', 'mukbang', 'baking', 'chef', 'meal', 'kitchen', 'dish', 'street food', 'taste test', 'asmr food'],
  finance: ['finance', 'investing', 'stock', 'market', 'crypto', 'bitcoin', 'money', 'wealth', 'trading', 'mutual fund', 'sip', 'zerodha', 'groww', 'budget', 'savings'],
  news: ['news', 'politics', 'interview', 'debate', 'election', 'president', 'government', 'war', 'economy', 'breaking', 'current affairs', 'analysis'],
  education: ['learn', 'education', 'history', 'science', 'math', 'lesson', 'course', 'explained', 'how to', 'why does', 'what is', 'kurzgesagt', 'ted', 'lecture'],
  lifestyle: ['lifestyle', 'day in my life', 'routine', 'productivity', 'morning', 'night', 'habits', 'motivation', 'self improvement', 'minimalism', 'aesthetic'],
  film: ['movie', 'film', 'trailer', 'review', 'series', 'anime', 'netflix', 'episode', 'reaction', 'breakdown', 'explained', 'ending', 'webseries'],
  podcast: ['podcast', 'episode', 'interview', 'conversation', 'joe rogan', 'lex fridman', 'nikhil kamath', 'ranveer allahbadia', 'beerbiryani', 'scene on radio'],
  cars: ['car', 'auto', 'vehicle', 'driving', 'race', 'f1', 'formula 1', 'motogp', 'bike', 'motorcycle', 'review', 'test drive', 'horsepower', 'ev', 'electric vehicle'],
  fashion: ['fashion', 'style', 'outfit', 'clothes', 'lookbook', 'ootd', 'haul', 'thrift', 'designer', 'streetwear', 'makeup', 'beauty', 'skincare'],
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
  const sixMonths = 180 * 24 * 60 * 60 * 1000
  // 1.0 for today, ~0.0 for 6 months ago — shorter window than before
  return Math.max(0, 1 - ageMs / sixMonths)
}

// Extract a "content identity" — the show, artist, or series name
// Used to limit how many videos from the same content appear
// Generate a content fingerprint from the most meaningful words in the title
// Videos with similar fingerprints are considered "same zone" content
function extractContentFingerprint(title: string, creator: string, topic: string): string {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'is', 'are', 'was', 'be', 'this', 'that', 'my', 'your',
    'i', 'me', 'we', 'you', 'he', 'she', 'it', 'they', 'what', 'how', 'why',
    'when', 'where', 'who', 'will', 'do', 'did', 'has', 'have', 'had',
    'video', 'watch', 'new', 'full', 'official', 'ft', 'feat', 'vs', 'ep',
    'part', 'episode', 'season', 'series', 'live', 'best', 'top', 'most'
  ])

  // Extract meaningful words from title
  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w))

  // Take the 2 most significant words + topic as the fingerprint
  // This means two videos about "kohli batting" both get fingerprint "cricket:kohli:batting"
  const keywords = words.slice(0, 2).sort()
  return `${topic}:${keywords.join(':')}`
}

// Proxy for video quality based on observable signals
function qualityScore(item: ActivityItem, watchCount: number): number {
  let score = 0.5 // baseline

  // Reward re-watches — if you watched it twice it's probably good
  if (watchCount > 1) score += Math.min(watchCount * 0.1, 0.3)

  // Penalise spammy titles
  const title = item.title || ''
  const capsRatio = (title.match(/[A-Z]/g) || []).length / Math.max(title.length, 1)
  if (capsRatio > 0.5) score -= 0.2 // mostly caps = spammy

  const excessivePunctuation = (title.match(/[!?]{2,}/g) || []).length
  if (excessivePunctuation > 0) score -= 0.1

  const clickbaitWords = ['gone wrong', 'gone sexual', 'not clickbait', 'you wont believe', 
    'shocking', 'exposed', '**', '😱😱', 'must watch']
  const lowerTitle = title.toLowerCase()
  if (clickbaitWords.some(w => lowerTitle.includes(w))) score -= 0.15

  // Reward longer titles (usually more descriptive = more intentional content)
  if (title.length > 30 && title.length < 80) score += 0.1

  return Math.max(0, Math.min(1, score))
}

type ContentType = 
  | 'personality_revealing'  // shows who the person is
  | 'entertainment'          // generic entertainment
  | 'music'                  // music videos / audio
  | 'news'                   // news clips
  | 'sports_highlights'      // game footage
  | 'educational'            // explainers / tutorials
  | 'commercial'             // trailers / ads / promos

function classifyContentType(title: string, creator: string): ContentType {
  const text = (title + ' ' + creator).toLowerCase()

  // MUSIC — official releases reveal nothing personal
  const musicSignals = [
    'official video', 'official music video', 'official audio', 'official lyric',
    'lyrics video', 'music video', 'vevo', '- topic',
    'full album', 'album stream', 'karaoke', 'cover song',
    't-series', 'zee music', 'saregama', 'tips official', 'sony music',
    'warner music', 'universal music',
  ]
  if (musicSignals.some(s => text.includes(s))) return 'music'

  // NEWS — reveals political lean but not personality
  const newsSignals = [
    'breaking news', 'news update', 'live news', 'press conference',
    'budget 2', 'election result', 'parliament', 'lok sabha', 'rajya sabha',
    'aaj tak', 'ndtv', 'republic tv', 'times now', 'india tv',
    'cnn', 'bbc news', 'fox news', 'msnbc', 'abc news',
  ]
  if (newsSignals.some(s => text.includes(s))) return 'news'

  // SPORTS HIGHLIGHTS — game footage not personality
  const sportsHighlightSignals = [
    'match highlights', 'full match', 'full game', 'race highlights',
    'innings highlights', 'goals scored', 'extended highlights',
    'live match', 'live score', 'matchday',
  ]
  if (sportsHighlightSignals.some(s => text.includes(s))) return 'sports_highlights'

  // COMMERCIAL — trailers, promos, ads
  const commercialSignals = [
    'official trailer', 'trailer 2', 'teaser trailer', 'final trailer',
    'movie trailer', 'series trailer', 'first look', 'promo',
    'ad film', 'advertisement',
  ]
  if (commercialSignals.some(s => text.includes(s))) return 'commercial'

  // EDUCATIONAL — reveals curiosity but not humor/personality
  const educationalSignals = [
    'how to ', 'tutorial', 'explained', 'full course', 'lecture',
    'step by step', 'beginners guide', 'learn ', 'masterclass',
    'crash course', 'full tutorial',
  ]
  if (educationalSignals.some(s => text.includes(s))) return 'educational'

  // PERSONALITY REVEALING — strong signals
  const personalitySignals = [
    // Opinion and takes
    'unpopular opinion', 'hot take', 'honest', 'rant', 'controversial',
    'overrated', 'underrated', 'nobody talks about', 'changed my mind',
    'i tried', 'i spent', 'i quit', 'why i', 'my honest',
    // Humor types
    'roast', 'comedy sketch', 'stand up', 'standup', 'funny video',
    'try not to laugh', 'dark humor', 'absurd', 'parody', 'satire',
    // Personal content
    'day in my life', 'storytime', 'vlog', 'my routine', 'q&a',
    'reacting to', 'reaction', 'responding to',
    // Niche interest
    'tier list', 'ranking', 'deep dive', 'obsessed with',
    'guilty pleasure', 'hidden gem', 'most underrated',
  ]
  if (personalitySignals.some(s => text.includes(s))) return 'personality_revealing'

  // Default — treat as personality revealing if no other signal matches
  // Better to include borderline content than exclude it
  return 'personality_revealing'
}

function nicheScore(item: ActivityItem): number {
  const title = (item.title || '').toLowerCase()
  const creator = (item.creator_name || '').toLowerCase()

  let score = 0.5

  const mainstreamSignals = [
    'vevo', 'official music video', 'official video', 'official audio',
    'topic', ' - topic',
    'netflix', 'prime video', 'disney', 'hbo', 'bbc', 'cnn', 'fox news',
    'sony music', 'universal music', 'warner music', 't-series', 'zee music',
    'saregama', 'tips official', 'sony liv',
    'espncricinfo', 'bcci', 'star sports', 'sky sports', 'nba official',
    'highlights', 'official channel', 'official page',
  ]
  if (mainstreamSignals.some(s => title.includes(s) || creator.includes(s))) {
    score -= 0.3
  }

  const nicheSignals = [
    'my ', 'i tried', 'i made', 'i spent', 'day in my life', 'storytime',
    'unpopular opinion', 'honest review', 'i quit', 'why i',
    'vlog', 'rant', 'reaction to', 'responding to',
    'tier list', 'ranking', 'deep dive',
    'hot take', 'controversial', 'nobody talks about', 'underrated',
    'obsessed with', 'changed my mind', 'overrated',
  ]
  if (nicheSignals.some(s => title.includes(s))) {
    score += 0.15
  }

  if (!creator.includes('official') && !creator.includes('records') &&
      !creator.includes('music') && !creator.includes('entertainment')) {
    score += 0.1
  }

  return Math.max(0, Math.min(1, score))
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

  // Count creator frequency in full history
  const creatorCounts = new Map<string, number>()
  for (const item of items) {
    if (item.creator_name) {
      creatorCounts.set(item.creator_name, (creatorCounts.get(item.creator_name) || 0) + 1)
    }
  }

  // Count how many times each video was watched (re-watch signal)
const videoWatchCounts = new Map<string, number>()
for (const item of items) {
  if (item.youtube_video_id) {
    videoWatchCounts.set(item.youtube_video_id, (videoWatchCounts.get(item.youtube_video_id) || 0) + 1)
  }
}

  const maxCreatorCount = Math.max(...Array.from(creatorCounts.values()), 1)

  // Count topic frequency in full history
  const topicCounts = new Map<string, number>()
  for (const item of items) {
    const topic = classifyTopic(item.title, item.creator_name)
    topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1)
  }
  const maxTopicCount = Math.max(...Array.from(topicCounts.values()), 1)

  // Score each unique item
  type ScoredItem = ActivityItem & { 
  score: number
  topic: string
  contentIdentity: string
  contentType: ContentType  // add this
}

const scored: ScoredItem[] = unique.map(item => {
  const topic = classifyTopic(item.title, item.creator_name)
  const contentType = classifyContentType(item.title, item.creator_name)  // add this
  const topicFreq = (topicCounts.get(topic) || 0) / maxTopicCount
  const creatorRepeat = Math.min((creatorCounts.get(item.creator_name) || 0) / maxCreatorCount, 1)
  const recency = recencyScore(item.watched_at)
  const contentIdentity = extractContentFingerprint(item.title, item.creator_name, topic)
  const watchCount = videoWatchCounts.get(item.youtube_video_id) || 1
  const quality = qualityScore(item, watchCount)
  const niche = nicheScore(item)

  // Penalise non-personality-revealing content heavily
  const contentTypeMultiplier: Record<ContentType, number> = {
    personality_revealing: 1.0,
    educational: 0.6,
    entertainment: 0.5,
    sports_highlights: 0.3,
    news: 0.2,
    music: 0.1,
    commercial: 0.0,
  }

  const multiplier = contentTypeMultiplier[contentType]

  const score = (
    recency * 0.10 +
    topicFreq * 0.25 +
    creatorRepeat * 0.20 +
    quality * 0.25 +
    niche * 0.10 +
    Math.random() * 0.10
  ) * multiplier

  return { ...item, score, topic, contentIdentity, contentType }
})

// Hard exclude non-personality content from selection pool
const EXCLUDED_TYPES: ContentType[] = ['music', 'commercial', 'news', 'sports_highlights']
const eligible = scored.filter(s => !EXCLUDED_TYPES.includes(s.contentType))

  // Sort by score descending
  eligible.sort((a, b) => b.score - a.score)

  // Pick top 6 topics by frequency
  const sortedTopics = Array.from(topicCounts.entries())
    .filter(([t]) => t !== 'other')
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([t]) => t)

  // Select videos with strict diversity enforcement
  const selected: ScoredItem[] = []
  const creatorPickCount = new Map<string, number>()    // max 2 per creator
  const contentPickCount = new Map<string, number>()    // max 1 per content identity
  const topicPickCount = new Map<string, number>()      // max 3 per topic

  const MAX_PER_CREATOR = 1
  const MAX_PER_CONTENT = 1
  const MAX_PER_TOPIC = 2
  const TARGET = 10

  // First pass: pick best from each top topic
  for (const topic of sortedTopics) {
    if (selected.length >= TARGET) break
    const topicVideos = eligible.filter(s =>
      s.topic === topic &&
      !selected.find(sel => sel.youtube_video_id === s.youtube_video_id)
    )

    for (const video of topicVideos) {
      if (selected.length >= TARGET) break
      if ((topicPickCount.get(topic) || 0) >= MAX_PER_TOPIC) break

      const creatorCount = creatorPickCount.get(video.creator_name) || 0
      const contentCount = contentPickCount.get(video.contentIdentity) || 0

      if (creatorCount >= MAX_PER_CREATOR) continue
      if (contentCount >= MAX_PER_CONTENT) continue

      selected.push(video)
      topicPickCount.set(topic, (topicPickCount.get(topic) || 0) + 1)
      creatorPickCount.set(video.creator_name, creatorCount + 1)
      contentPickCount.set(video.contentIdentity, contentCount + 1)
    }
  }

  // Second pass: fill remaining slots from top scored, still enforcing diversity
  if (selected.length < 8) {
    for (const video of eligible) {
      if (selected.length >= TARGET) break
      if (selected.find(s => s.youtube_video_id === video.youtube_video_id)) continue

      const creatorCount = creatorPickCount.get(video.creator_name) || 0
      const contentCount = contentPickCount.get(video.contentIdentity) || 0

      if (creatorCount >= MAX_PER_CREATOR) continue
      if (contentCount >= MAX_PER_CONTENT) continue

      selected.push(video)
      creatorPickCount.set(video.creator_name, creatorCount + 1)
      contentPickCount.set(video.contentIdentity, contentCount + 1)
    }
  }

  // Light shuffle to avoid always showing same order
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