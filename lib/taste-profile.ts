import { ActivityItem, TasteProfile } from '@/types'

const TOPIC_KEYWORDS: Record<string, string[]> = {
  comedy: ['funny', 'comedy', 'meme', 'humor', 'laugh', 'joke', 'prank', 'roast', 'sketch'],
  football: ['football', 'soccer', 'goal', 'match', 'premier league', 'champions league', 'fifa', 'nfl', 'nba', 'basketball', 'sport', 'highlights'],
  fitness: ['workout', 'gym', 'fitness', 'exercise', 'training', 'muscle', 'cardio', 'yoga', 'bodybuilding'],
  tech: ['tech', 'programming', 'code', 'software', 'ai', 'machine learning', 'web dev', 'javascript', 'python', 'tutorial', 'developer', 'coding', 'review'],
  gaming: ['gaming', 'game', 'gameplay', 'gamer', 'playthrough', 'walkthrough', 'lets play', 'esport', 'minecraft', 'fortnite', 'valorant'],
  music: ['music', 'song', 'official video', 'lyrics', 'album', 'concert', 'live', 'rap', 'hip hop', 'pop', 'rock'],
  travel: ['travel', 'vlog', 'visit', 'tour', 'adventure', 'trip', 'explore', 'documentary'],
  food: ['food', 'cook', 'recipe', 'eat', 'restaurant', 'mukbang', 'baking', 'chef', 'meal'],
  news: ['news', 'politics', 'interview', 'debate', 'election', 'president', 'government', 'economy'],
  education: ['learn', 'education', 'history', 'science', 'math', 'explained', 'how to', 'course'],
  lifestyle: ['lifestyle', 'day in', 'routine', 'productivity', 'morning', 'habits', 'motivation', 'self improvement'],
  film: ['movie', 'film', 'trailer', 'anime', 'netflix', 'episode', 'reaction'],
}

const TOPIC_LABELS: Record<string, string> = {
  comedy: 'comedy & memes',
  football: 'sports',
  fitness: 'fitness',
  tech: 'tech & coding',
  gaming: 'gaming',
  music: 'music',
  travel: 'travel vlogs',
  food: 'food & cooking',
  news: 'news & politics',
  education: 'learning',
  lifestyle: 'lifestyle & productivity',
  film: 'movies & shows',
  other: 'mixed content',
}

const VIBE_TEMPLATES: Record<string, string[]> = {
  comedy: ['loves meme culture and comedy clips', 'always hunting for the next funny thing', 'here for the laughs and good vibes'],
  football: ['big into sports and match highlights', 'watches every game clip they can find', 'sports is basically a personality'],
  fitness: ['gym content and fitness motivation', 'into health and performance content', 'training videos are a daily ritual'],
  tech: ['deep in tech and programming content', 'codes, builds, and stays up to date on AI', 'the type who has VS Code open at all times'],
  gaming: ['serious gamer energy, always in the meta', 'lives and breathes gaming content', 'from walkthroughs to esports, gaming is life'],
  music: ['music taste is everything to them', 'always discovering new artists and sounds', 'playlist curation is a spiritual practice'],
  travel: ['constantly watching travel content and dreaming', 'wanderlust in vlog form', 'the horizon is always the goal'],
  food: ['into food content — cooking, eating, exploring', 'kitchen creativity meets food culture', 'mukbang enthusiast and recipe collector'],
  lifestyle: ['big on productivity and self-improvement content', 'optimizing everything, watching every growth video', 'journaling, routines, and better habits'],
  education: ['intellectual content all day, loves learning', 'documentaries and explainers are a comfort watch', 'the kind of person who finishes courses for fun'],
  film: ['cinematic taste, watches trailers before release', 'lives in the world of shows and films', 'anime, movies, and pop culture references always ready'],
}

export function generateTasteProfile(items: ActivityItem[]): TasteProfile {
  if (items.length === 0) {
    return {
      top_topics: [],
      vibe_summary: 'Not enough watch history to build a vibe profile yet.',
    }
  }

  // Count topic hits
  const topicScores = new Map<string, number>()
  for (const item of items) {
    const text = (item.title + ' ' + item.creator_name).toLowerCase()
    for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
      const hits = keywords.filter(kw => text.includes(kw)).length
      if (hits > 0) {
        topicScores.set(topic, (topicScores.get(topic) || 0) + hits)
      }
    }
  }

  // Sort topics by score
  const sorted = Array.from(topicScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const topTopics = sorted.map(([topic]) => TOPIC_LABELS[topic] || topic)
  const topKeys = sorted.map(([topic]) => topic)

  // Build vibe summary
  let vibe_summary: string

  if (topKeys.length === 0) {
    vibe_summary = 'Eclectic taste — hard to pin down, and that\'s kind of the point.'
  } else if (topKeys.length === 1) {
    const templates = VIBE_TEMPLATES[topKeys[0]] || ['watches a lot of content']
    vibe_summary = templates[Math.floor(Math.random() * templates.length)]
    vibe_summary = vibe_summary.charAt(0).toUpperCase() + vibe_summary.slice(1) + '.'
  } else {
    const primary = topKeys[0]
    const secondary = topKeys[1]
    const primaryTemplates = VIBE_TEMPLATES[primary] || ['into content']
    const primaryDesc = primaryTemplates[Math.floor(Math.random() * primaryTemplates.length)]
    const secondaryLabel = TOPIC_LABELS[secondary] || secondary

    if (topKeys.length >= 3) {
      const tertiaryLabel = TOPIC_LABELS[topKeys[2]] || topKeys[2]
      vibe_summary = `${primaryDesc.charAt(0).toUpperCase() + primaryDesc.slice(1)}, with a side of ${secondaryLabel} and ${tertiaryLabel}.`
    } else {
      vibe_summary = `${primaryDesc.charAt(0).toUpperCase() + primaryDesc.slice(1)}, plus a lot of ${secondaryLabel} content.`
    }
  }

  return { top_topics: topTopics, vibe_summary }
}
