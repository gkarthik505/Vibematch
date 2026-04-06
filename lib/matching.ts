import { PersonalityDimensions } from './personality'

export interface MatchScore {
  overall: number
  dimensions: {
    humor: number
    music: number
    film: number
    sports: number
    tech: number
    gaming: number
    curiosity: number
    lifestyle: number
    pets: number
  }
  conversationStarter: string | null
  sharedTopics: string[]
  theirTopics: string[]
}

function scoreSimilarity(a: number, b: number): number {
  return Math.round((1 - Math.abs(a - b)) * 100)
}

function scoreHumor(a: PersonalityDimensions, b: PersonalityDimensions): number {
  const intensityMatch = scoreSimilarity(a.humor.intensity, b.humor.intensity)
  const typeOverlap = a.humor.types.filter(t => b.humor.types.includes(t)).length
  const typeScore = Math.min(typeOverlap / Math.max(a.humor.types.length, 1), 1) * 100
  return Math.round(intensityMatch * 0.4 + typeScore * 0.6)
}

function scoreMusic(a: PersonalityDimensions, b: PersonalityDimensions): number {
  const intensityMatch = scoreSimilarity(a.pop_culture.music.intensity, b.pop_culture.music.intensity)
  const genreOverlap = a.pop_culture.music.genres.filter(g => b.pop_culture.music.genres.includes(g)).length
  const genreScore = Math.min(genreOverlap / Math.max(a.pop_culture.music.genres.length, 1), 1) * 100
  return Math.round(intensityMatch * 0.3 + genreScore * 0.7)
}

function scoreFilm(a: PersonalityDimensions, b: PersonalityDimensions): number {
  const intensityMatch = scoreSimilarity(a.pop_culture.film.intensity, b.pop_culture.film.intensity)
  const typeOverlap = a.pop_culture.film.types.filter(t => b.pop_culture.film.types.includes(t)).length
  const typeScore = Math.min(typeOverlap / Math.max(a.pop_culture.film.types.length, 1), 1) * 100
  return Math.round(intensityMatch * 0.3 + typeScore * 0.7)
}

function scoreSports(a: PersonalityDimensions, b: PersonalityDimensions): number {
  const intensityMatch = scoreSimilarity(a.sports.intensity, b.sports.intensity)
  const sameSport = a.sports.primary === b.sports.primary ? 100 : 0
  const sameStyle = a.sports.style === b.sports.style ? 100 : 0
  return Math.round(intensityMatch * 0.3 + sameSport * 0.5 + sameStyle * 0.2)
}

function scoreTech(a: PersonalityDimensions, b: PersonalityDimensions): number {
  const intensityMatch = scoreSimilarity(a.tech.intensity, b.tech.intensity)
  const styleMatch = a.tech.style === b.tech.style ? 100 : 50
  const aiMatch = scoreSimilarity(a.tech.ai_interest, b.tech.ai_interest)
  return Math.round(intensityMatch * 0.4 + styleMatch * 0.3 + aiMatch * 0.3)
}

// Generate a specific conversation starter based on deepest overlap
function generateConversationStarter(
  a: PersonalityDimensions,
  b: PersonalityDimensions
): string | null {
  // Music genre overlap — most specific
  const sharedGenres = a.pop_culture.music.genres.filter(g =>
    b.pop_culture.music.genres.includes(g)
  )
  if (sharedGenres.length > 0 && a.pop_culture.music.intensity > 0.3 && b.pop_culture.music.intensity > 0.3) {
    const genreLabels: Record<string, string> = {
      rock: 'rock music', hiphop: 'hip-hop', indie: 'indie music',
      electronic: 'electronic music', classical: 'classical music',
      bollywood: 'Bollywood music', pop: 'pop music', indie_pop: 'indie pop',
    }
    const genre = genreLabels[sharedGenres[0]] || sharedGenres[0]
    return `You both seem deep into ${genre}. Ask them what they've been listening to lately.`
  }

  // Same sport + same style
  if (
    a.sports.primary === b.sports.primary &&
    a.sports.primary !== 'general' &&
    a.sports.intensity > 0.2 &&
    b.sports.intensity > 0.2
  ) {
    const sportLabels: Record<string, string> = {
      cricket: 'cricket', football: 'football', basketball: 'basketball',
      tennis: 'tennis', f1: 'F1', badminton: 'badminton', squash: 'squash',
    }
    const sport = sportLabels[a.sports.primary] || a.sports.primary
    if (a.sports.style === b.sports.style && a.sports.style === 'analysis') {
      return `You're both ${sport} analysts at heart — ask them their take on the current season.`
    }
    return `You're both ${sport} fans. Could be a good conversation.`
  }

  // Shared humor type
  const sharedHumor = a.humor.types.filter(t => b.humor.types.includes(t))
  if (sharedHumor.length > 0 && a.humor.intensity > 0.3 && b.humor.intensity > 0.3) {
    const humorLabels: Record<string, string> = {
      dark: 'dark humor', observational: 'observational comedy',
      absurd: 'absurd comedy', intellectual: 'intellectual humor',
      prank: 'prank content', slapstick: 'slapstick comedy',
    }
    const humor = humorLabels[sharedHumor[0]] || sharedHumor[0]
    return `You both gravitate toward ${humor}. You'd probably find the same things funny.`
  }

  // Shared film type
  const sharedFilm = a.pop_culture.film.types.filter(t => b.pop_culture.film.types.includes(t))
  if (sharedFilm.length > 0) {
    const filmLabels: Record<string, string> = {
      horror: 'horror films', cerebral: 'cerebral cinema', anime: 'anime',
      bollywood: 'Bollywood', blockbuster: 'blockbusters', indie: 'indie films',
    }
    const film = filmLabels[sharedFilm[0]] || sharedFilm[0]
    return `You're both into ${film}. Ask them what they've watched recently.`
  }

  // Both multilingual
  if (a.language.multilingual && b.language.multilingual) {
    return `You both consume content across multiple languages. Could be an interesting common ground.`
  }

  // Tech overlap
  if (a.tech.intensity > 0.3 && b.tech.intensity > 0.3 && a.tech.style === b.tech.style) {
    if (a.tech.style === 'developer') return `You're both in tech/dev. Ask them what they're building.`
    if (a.tech.ai_interest > 0.4 && b.tech.ai_interest > 0.4) return `You're both following AI closely. Plenty to talk about there.`
  }

  return null
}

function getSharedTopics(a: PersonalityDimensions, b: PersonalityDimensions): string[] {
  const shared: string[] = []
  if (a.humor.intensity > 0.2 && b.humor.intensity > 0.2) {
    const overlap = a.humor.types.filter(t => b.humor.types.includes(t))
    if (overlap.length > 0) shared.push(overlap[0] + ' humor')
  }
  if (a.sports.primary === b.sports.primary && a.sports.primary !== 'general') {
    shared.push(a.sports.primary)
  }
  const sharedGenres = a.pop_culture.music.genres.filter(g => b.pop_culture.music.genres.includes(g))
  if (sharedGenres.length > 0) shared.push(sharedGenres[0] + ' music')
  const sharedFilm = a.pop_culture.film.types.filter(t => b.pop_culture.film.types.includes(t))
  if (sharedFilm.length > 0) shared.push(sharedFilm[0] + ' films')
  if (a.tech.intensity > 0.3 && b.tech.intensity > 0.3) shared.push('tech')
  return shared.slice(0, 3)
}

function getTheirTopics(a: PersonalityDimensions, b: PersonalityDimensions): string[] {
  const theirs: string[] = []
  if (b.gaming.intensity > 0.3 && a.gaming.intensity < 0.2) theirs.push('gaming')
  if (b.curiosity > 0.4 && a.curiosity < 0.2) theirs.push('documentaries')
  if (b.lifestyle.fitness > 0.4 && a.lifestyle.fitness < 0.2) theirs.push('fitness')
  if (b.lifestyle.travel.intensity > 0.4 && a.lifestyle.travel.intensity < 0.2) theirs.push('travel')
  if (b.pets.intensity > 0.3 && a.pets.intensity < 0.2) theirs.push('pets')
  if (b.finance.intensity > 0.3 && a.finance.intensity < 0.2) theirs.push('investing')
  return theirs.slice(0, 2)
}

export function computeMatchScore(
  myDimensions: PersonalityDimensions,
  theirDimensions: PersonalityDimensions
): MatchScore {
  const humor = scoreHumor(myDimensions, theirDimensions)
  const music = scoreMusic(myDimensions, theirDimensions)
  const film = scoreFilm(myDimensions, theirDimensions)
  const sports = scoreSports(myDimensions, theirDimensions)
  const tech = scoreTech(myDimensions, theirDimensions)
  const gaming = scoreSimilarity(myDimensions.gaming.intensity, theirDimensions.gaming.intensity)
  const curiosity = scoreSimilarity(myDimensions.curiosity, theirDimensions.curiosity)
  const lifestyle = Math.round(
    scoreSimilarity(myDimensions.lifestyle.fitness, theirDimensions.lifestyle.fitness) * 0.4 +
    scoreSimilarity(myDimensions.lifestyle.food.intensity, theirDimensions.lifestyle.food.intensity) * 0.3 +
    scoreSimilarity(myDimensions.lifestyle.travel.intensity, theirDimensions.lifestyle.travel.intensity) * 0.3
  )
  const pets = scoreSimilarity(myDimensions.pets.intensity, theirDimensions.pets.intensity)

  // Overall — weighted by what matters most for compatibility
  const overall = Math.round(
    humor * 0.25 +
    music * 0.20 +
    film * 0.15 +
    sports * 0.15 +
    tech * 0.10 +
    lifestyle * 0.10 +
    curiosity * 0.05
  )

  return {
    overall,
    dimensions: { humor, music, film, sports, tech, gaming, curiosity, lifestyle, pets },
    conversationStarter: generateConversationStarter(myDimensions, theirDimensions),
    sharedTopics: getSharedTopics(myDimensions, theirDimensions),
    theirTopics: getTheirTopics(myDimensions, theirDimensions),
  }
}