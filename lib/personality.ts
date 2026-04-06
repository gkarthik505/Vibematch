import { ActivityItem } from '@/types'

export interface PersonalityDimensions {
  language: {
    primary: string           // english, hindi, tamil, telugu, malayalam, kannada, bengali
    multilingual: boolean
    distribution: Record<string, number>  // e.g. { english: 0.6, hindi: 0.3, tamil: 0.1 }
  }
  humor: {
    intensity: number         // 0-1
    types: string[]           // dark, observational, absurd, intellectual, slapstick, prank
  }
  pop_culture: {
    film: {
      intensity: number
      types: string[]         // blockbuster, cerebral, horror, indie, world_cinema, anime, bollywood
    }
    tv: {
      intensity: number
      types: string[]         // reality, drama, thriller, sitcom, documentary, anime
    }
    music: {
      intensity: number
      engagement: 'background' | 'casual' | 'enthusiast' | 'obsessed'
      genres: string[]
    }
  }
  sports: {
    intensity: number
    primary: string
    style: 'highlights' | 'analysis' | 'live'
  }
  politics: {
    intensity: number
    lean: 'left' | 'right' | 'centre' | 'none'
  }
  curiosity: number           // 0-1 science/history/documentary
  tech: {
    intensity: number
    style: 'consumer' | 'developer' | 'both'
    ai_interest: number       // 0-1
  }
  lifestyle: {
    fitness: number
    food: {
      intensity: number
      style: 'cooking' | 'watching' | 'both'
    }
    travel: {
      intensity: number
      style: 'budget' | 'luxury' | 'adventure' | 'general'
    }
  }
  pets: {
    intensity: number
    type: 'cat' | 'dog' | 'both' | 'other' | 'none'
  }
  gaming: {
    intensity: number
    style: 'casual' | 'hardcore'
    genres: string[]
  }
  finance: {
    intensity: number
    style: 'passive' | 'active'
  }
}

// ─── LANGUAGE DETECTION ──────────────────────────────────────────────────────

const HINDI_SIGNALS = [
  // Channels
  't-series', 'zee music', 'saregama', 'tips official', 'sony music india',
  'bb ki vines', 'carryminati', 'amit bhadana', 'ashish chanchlani',
  'triggered insaan', 'elvish yadav', 'round2hell', 'mythpat',
  'tanmay bhat', 'nikhil kamath', 'ranveer allahbadia', 'beerbiryani',
  'aaj tak', 'ndtv india', 'zee news', 'republic bharat',
  // Title keywords
  'hindi', 'bollywood', 'desi', 'hindustani', 'bharat', 'india wale',
  'ek baar', 'kya lagta', 'yaar', 'bhai', 'mere', 'tumhare',
]

const TAMIL_SIGNALS = [
  'sun tv', 'vijay tv', 'zee tamil', 'kalaignar tv', 'polimer tv',
  'tamil', 'kollywood', 'thalapathy', 'vijay', 'ajith', 'rajinikanth',
  'kamal haasan', 'suriya', 'dhanush', 'sivakarthikeyan',
  'anirudh', 'yuvan shankar raja', 'harris jayaraj',
  'vadivelu', 'goundamani', 'santhanam',
]

const TELUGU_SIGNALS = [
  'telugu', 'tollywood', 'mahesh babu', 'prabhas', 'jr ntr',
  'allu arjun', 'ram charan', 'trivikram', 'ss rajamouli',
  'gemini tv', 'star maa', 'zee telugu', 'etv telugu',
  'dsp', 'thaman', 'mm keeravani',
]

const MALAYALAM_SIGNALS = [
  'malayalam', 'mollywood', 'mammootty', 'mohanlal', 'fahadh faasil',
  'dulquer salmaan', 'asif ali', 'prithviraj',
  'mazhavil manorama', 'surya tv', 'asianet', 'flowers tv',
]

const KANNADA_SIGNALS = [
  'kannada', 'sandalwood', 'darshan', 'yash', 'sudeep', 'puneeth',
  'zee kannada', 'colors kannada', 'star suvarna', 'udaya tv',
]

const BENGALI_SIGNALS = [
  'bengali', 'tollywood bengali', 'dev', 'prosenjit', 'jeet',
  'star jalsha', 'zee bangla', 'colors bangla',
  'rabindranath', 'bangla', 'kolkata',
]

function detectLanguage(text: string): string {
  if (HINDI_SIGNALS.some(s => text.includes(s))) return 'hindi'
  if (TAMIL_SIGNALS.some(s => text.includes(s))) return 'tamil'
  if (TELUGU_SIGNALS.some(s => text.includes(s))) return 'telugu'
  if (MALAYALAM_SIGNALS.some(s => text.includes(s))) return 'malayalam'
  if (KANNADA_SIGNALS.some(s => text.includes(s))) return 'kannada'
  if (BENGALI_SIGNALS.some(s => text.includes(s))) return 'bengali'
  return 'english' // default
}

// ─── HUMOR ───────────────────────────────────────────────────────────────────

const HUMOR_TYPES: Record<string, string[]> = {
  dark: ['dark humor', 'dark comedy', 'offensive', 'roast', 'savage', 'brutal'],
  observational: ['relatable', 'when you', 'pov:', 'that moment', 'every person', 'types of'],
  absurd: ['absurd', 'surreal', 'weird', 'bizarre', 'random', 'nonsense', 'chaotic', 'unhinged'],
  prank: ['prank', 'hidden camera', 'gone wrong', 'social experiment', 'trolling'],
  intellectual: ['satire', 'parody', 'stand-up', 'standup', 'comedy special', 'wit', 'monologue'],
  slapstick: ['fail', 'try not to laugh', 'funny moments', 'bloopers', 'compilation'],
}

// ─── POP CULTURE ─────────────────────────────────────────────────────────────

const FILM_TYPES: Record<string, string[]> = {
  blockbuster: ['marvel', 'dc ', 'avengers', 'superman', 'batman', 'action movie', 'superhero', 'blockbuster'],
  cerebral: ['oscar', 'arthouse', 'christopher nolan', 'kubrick', 'scorsese', 'david fincher', 'a24', 'criterion'],
  horror: ['horror', 'scary', 'thriller', 'jump scare', 'haunted', 'slasher', 'paranormal'],
  indie: ['indie film', 'independent film', 'sundance', 'a24', 'short film'],
  world_cinema: ['korean film', 'french cinema', 'japanese film', 'parasite', 'squid game'],
  anime: ['anime', 'manga', 'naruto', 'one piece', 'attack on titan', 'demon slayer', 'jujutsu'],
  bollywood: ['bollywood', 'hindi film', 'srk', 'salman khan', 'aamir khan', 'karan johar'],
}

const TV_TYPES: Record<string, string[]> = {
  reality: ['reality tv', 'big boss', 'bigg boss', 'bachelor', 'survivor', 'love island', 'masterchef'],
  drama: ['breaking bad', 'better call saul', 'succession', 'game of thrones', 'drama series'],
  thriller: ['thriller', 'mystery', 'true crime', 'detective', 'crime show', 'dark series'],
  sitcom: ['sitcom', 'friends', 'office', 'seinfeld', 'how i met', 'brooklyn nine', 'comedy series'],
  documentary: ['documentary', 'docuseries', 'netflix documentary', 'true story', 'based on true'],
  anime: ['anime', 'crunchyroll', 'funimation'],
}

const MUSIC_GENRES: Record<string, string[]> = {
  hiphop: ['rap', 'hip hop', 'trap', 'drill', 'freestyle', 'cypher', 'kendrick', 'drake'],
  indie: ['indie', 'alternative', 'bedroom pop', 'lo-fi', 'folk', 'arctic monkeys'],
  electronic: ['edm', 'electronic', 'techno', 'house', 'trance', 'dj set'],
  classical: ['classical', 'orchestra', 'symphony', 'opera', 'carnatic', 'hindustani classical'],
  bollywood: ['bollywood music', 'hindi song', 'filmi', 'arijit', 'atif aslam', 'shreya ghoshal'],
  rock: ['rock', 'metal', 'punk', 'grunge', 'metallica', 'led zeppelin'],
  pop: ['pop', 'taylor swift', 'ed sheeran', 'ariana grande', 'billie eilish', 'the weeknd'],
  indie_pop: ['indie pop', 'bedroom pop', 'clairo', 'mac demarco', 'rex orange county'],
}

// ─── SPORTS ──────────────────────────────────────────────────────────────────

const SPORT_KEYWORDS: Record<string, string[]> = {
  cricket: ['cricket', 'ipl', 'test match', 'bcci', 'kohli', 'rohit', 'dhoni', 'bumrah', 'wicket'],
  football: ['football', 'soccer', 'premier league', 'champions league', 'messi', 'ronaldo', 'goal'],
  basketball: ['nba', 'basketball', 'lebron', 'curry', 'lakers', 'celtics', 'dunk'],
  tennis: ['tennis', 'wimbledon', 'federer', 'nadal', 'djokovic', 'us open'],
  f1: ['formula 1', 'f1 ', 'verstappen', 'hamilton', 'grand prix', 'monaco'],
  kabaddi: ['kabaddi', 'pkl', 'pro kabaddi'],
  wrestling: ['wwe', 'wrestling', 'ufc', 'mma', 'boxing', 'tyson'],
  badminton: ['badminton', 'pv sindhu', 'lakshya sen', 'saina nehwal', 'bwf', 'shuttlecock'],
  squash: ['squash', 'psf', 'world squash', 'nick matthew', 'ramy ashour', 'nour el sherbini'],
}

const SPORTS_ANALYSIS_SIGNALS = ['analysis', 'explained', 'tactics', 'breakdown', 'deep dive', 'podcast']
const SPORTS_HIGHLIGHTS_SIGNALS = ['highlights', 'best moments', 'top goals', 'compilation']

// ─── POLITICS ────────────────────────────────────────────────────────────────

const LEFT_SIGNALS = [
  'progressive', 'liberal', 'democrat', 'climate change', 'social justice',
  'aoc', 'bernie', 'lgbtq', 'equality', 'feminism',
]

const RIGHT_SIGNALS = [
  'conservative', 'republican', 'trump', 'maga', 'traditional values',
  'republic tv',  'sudarshan news', 'nationalist',
]

// ─── TECH ────────────────────────────────────────────────────────────────────

const DEVELOPER_SIGNALS = [
  'programming', 'coding', 'javascript', 'python', 'react', 'typescript',
  'api', 'backend', 'frontend', 'github', 'algorithm', 'data structure',
  'system design', 'leetcode', 'developer', 'software engineer',
]

const CONSUMER_TECH_SIGNALS = [
  'iphone', 'android', 'review', 'unboxing', 'best phone', 'laptop review',
  'apple', 'samsung', 'gadget', 'tech news',
]

const AI_SIGNALS = [
  'chatgpt', 'openai', 'claude', 'gemini', 'ai ', 'artificial intelligence',
  'machine learning', 'llm', 'gpt', 'midjourney', 'stable diffusion',
]

// ─── PETS ────────────────────────────────────────────────────────────────────

const PET_SIGNALS: Record<string, string[]> = {
  cat: ['cat', 'kitten', 'kitty', 'meow', 'feline', 'tabby', 'cats of'],
  dog: ['dog', 'puppy', 'pup', 'doggo', 'woof', 'canine', 'golden retriever', 'labrador', 'husky'],
  other: ['pet', 'animal', 'hamster', 'rabbit', 'fish tank', 'reptile', 'parrot', 'bird'],
}

// ─── GAMING ──────────────────────────────────────────────────────────────────

const GAMING_GENRES: Record<string, string[]> = {
  fps: ['fps', 'valorant', 'cod', 'counter strike', 'cs2', 'overwatch', 'apex legends'],
  rpg: ['rpg', 'elden ring', 'zelda', 'final fantasy', 'baldurs gate', 'witcher'],
  sports_games: ['fifa', 'fc 24', 'nba 2k', 'cricket game', 'efootball'],
  mobile: ['bgmi', 'free fire', 'clash of clans', 'mobile game', 'clash royale'],
  sandbox: ['minecraft', 'roblox', 'terraria', 'stardew valley'],
  strategy: ['strategy', 'age of empires', 'civilization', 'chess'],
}

const HARDCORE_GAMING_SIGNALS = [
  'pro player', 'rank', 'competitive', 'esport', 'tournament', 'world championship',
  'speedrun', 'no death', 'hardcore mode', 'platinum trophy',
]

// ─── TRAVEL ──────────────────────────────────────────────────────────────────

const TRAVEL_STYLES: Record<string, string[]> = {
  budget: ['budget travel', 'cheap', 'backpack', 'hostel', 'solo travel on a budget'],
  luxury: ['luxury travel', 'five star', '5 star', 'business class', 'first class', 'resort'],
  adventure: ['adventure', 'hiking', 'trekking', 'camping', 'extreme', 'mountain', 'scuba'],
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function countMatches(text: string, keywords: string[]): number {
  return keywords.filter(kw => text.includes(kw)).length
}

function toIntensity(count: number, total: number, threshold: number = 5): number {
  return Math.min(count / Math.max(total * (threshold / 100), 1), 1.0)
}

// ─── MAIN FUNCTION ───────────────────────────────────────────────────────────

export function generatePersonalityDimensions(items: ActivityItem[]): PersonalityDimensions {
  const total = items.length
  if (total === 0) return getDefaults()

  // Counters
  const langCounts: Record<string, number> = {}
  let comedyCount = 0
  const humorTypeCounts: Record<string, number> = {}
  const filmTypeCounts: Record<string, number> = {}
  const tvTypeCounts: Record<string, number> = {}
  let musicCount = 0
  const musicGenreCounts: Record<string, number> = {}
  let sportsCount = 0
  const sportTypeCounts: Record<string, number> = {}
  let sportsAnalysisCount = 0
  let sportsHighlightsCount = 0
  let politicsCount = 0
  let leftCount = 0
  let rightCount = 0
  let techCount = 0
  let developerCount = 0
  let consumerTechCount = 0
  let aiCount = 0
  let curiosityCount = 0
  let fitnessCount = 0
  let foodCount = 0
  let cookingCount = 0
  let travelCount = 0
  const travelStyleCounts: Record<string, number> = {}
  let petCount = 0
  const petTypeCounts: Record<string, number> = {}
  let gamingCount = 0
  const gamingGenreCounts: Record<string, number> = {}
  let hardcoreGamingCount = 0
  let financeCount = 0
  let activeFinanceCount = 0

  for (const item of items) {
    const text = (item.title + ' ' + (item.creator_name || '')).toLowerCase()

    // Language
    const lang = detectLanguage(text)
    langCounts[lang] = (langCounts[lang] || 0) + 1

    // Humor
    if (countMatches(text, ['funny', 'comedy', 'humor', 'joke', 'laugh', 'meme', 'hilarious', 'lol']) > 0) {
      comedyCount++
      for (const [type, keywords] of Object.entries(HUMOR_TYPES)) {
        if (countMatches(text, keywords) > 0) {
          humorTypeCounts[type] = (humorTypeCounts[type] || 0) + 1
        }
      }
    }

    // Film types
    for (const [type, keywords] of Object.entries(FILM_TYPES)) {
      if (countMatches(text, keywords) > 0) {
        filmTypeCounts[type] = (filmTypeCounts[type] || 0) + 1
      }
    }

    // TV types
    for (const [type, keywords] of Object.entries(TV_TYPES)) {
      if (countMatches(text, keywords) > 0) {
        tvTypeCounts[type] = (tvTypeCounts[type] || 0) + 1
      }
    }

    // Music
    if (countMatches(text, ['music', 'song', 'album', 'artist', 'concert', 'lyrics', 'playlist', 'singer']) > 0) {
      musicCount++
      for (const [genre, keywords] of Object.entries(MUSIC_GENRES)) {
        if (countMatches(text, keywords) > 0) {
          musicGenreCounts[genre] = (musicGenreCounts[genre] || 0) + 1
        }
      }
    }

    // Sports
    for (const [sport, keywords] of Object.entries(SPORT_KEYWORDS)) {
      if (countMatches(text, keywords) > 0) {
        sportsCount++
        sportTypeCounts[sport] = (sportTypeCounts[sport] || 0) + 1
        if (countMatches(text, SPORTS_ANALYSIS_SIGNALS) > 0) sportsAnalysisCount++
        else if (countMatches(text, SPORTS_HIGHLIGHTS_SIGNALS) > 0) sportsHighlightsCount++
        break
      }
    }

    // Politics
    const leftScore = countMatches(text, LEFT_SIGNALS)
    const rightScore = countMatches(text, RIGHT_SIGNALS)
    if (leftScore > 0 || rightScore > 0) {
      politicsCount++
      leftCount += leftScore
      rightCount += rightScore
    }

    // Tech
    const devScore = countMatches(text, DEVELOPER_SIGNALS)
    const consumerScore = countMatches(text, CONSUMER_TECH_SIGNALS)
    const aiScore = countMatches(text, AI_SIGNALS)
    if (devScore > 0 || consumerScore > 0 || aiScore > 0) {
      techCount++
      developerCount += devScore
      consumerTechCount += consumerScore
      aiCount += aiScore
    }

    // Curiosity
    if (countMatches(text, ['explained', 'how does', 'why does', 'science', 'history', 'documentary', 'kurzgesagt', 'veritasium', 'ted talk', 'physics', 'biology', 'philosophy']) > 0) {
      curiosityCount++
    }

    // Fitness
    if (countMatches(text, ['workout', 'gym', 'fitness', 'exercise', 'training', 'diet', 'nutrition', 'muscle', 'yoga', 'running', 'cardio']) > 0) {
      fitnessCount++
    }

    // Food
    if (countMatches(text, ['food', 'recipe', 'cook', 'eat', 'restaurant', 'chef', 'mukbang', 'street food', 'baking']) > 0) {
      foodCount++
      if (countMatches(text, ['recipe', 'cook', 'baking', 'how to make', 'homemade']) > 0) cookingCount++
    }

    // Travel
    if (countMatches(text, ['travel', 'vlog', 'visit', 'country', 'city', 'tour', 'adventure', 'trip', 'backpack']) > 0) {
      travelCount++
      for (const [style, keywords] of Object.entries(TRAVEL_STYLES)) {
        if (countMatches(text, keywords) > 0) {
          travelStyleCounts[style] = (travelStyleCounts[style] || 0) + 1
        }
      }
    }

    // Pets
    for (const [type, keywords] of Object.entries(PET_SIGNALS)) {
      if (countMatches(text, keywords) > 0) {
        petCount++
        petTypeCounts[type] = (petTypeCounts[type] || 0) + 1
        break
      }
    }

    // Gaming
    if (countMatches(text, ['gaming', 'gameplay', 'game', 'playthrough', 'gamer', 'esport', 'stream']) > 0) {
      gamingCount++
      for (const [genre, keywords] of Object.entries(GAMING_GENRES)) {
        if (countMatches(text, keywords) > 0) {
          gamingGenreCounts[genre] = (gamingGenreCounts[genre] || 0) + 1
        }
      }
      if (countMatches(text, HARDCORE_GAMING_SIGNALS) > 0) hardcoreGamingCount++
    }

    // Finance
    if (countMatches(text, ['invest', 'stock', 'crypto', 'finance', 'money', 'trading', 'mutual fund', 'zerodha', 'groww', 'nifty', 'sensex']) > 0) {
      financeCount++
      if (countMatches(text, ['trading', 'crypto', 'options', 'technical analysis', 'portfolio']) > 0) activeFinanceCount++
    }
  }

  // ── DERIVE DIMENSIONS ──────────────────────────────────────────────────────

  // Language
  const totalLangCount = Object.values(langCounts).reduce((a, b) => a + b, 0)
  const langDistribution: Record<string, number> = {}
  for (const [lang, count] of Object.entries(langCounts)) {
    langDistribution[lang] = Math.round((count / totalLangCount) * 100) / 100
  }
  const primaryLanguage = Object.entries(langCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'english'
  const nonEnglishRatio = 1 - (langDistribution['english'] || 0)
  const multilingual = Object.keys(langCounts).length > 2 || (nonEnglishRatio > 0.2 && langDistribution['english'] > 0.2)

  // Humor
  const topHumorTypes = Object.entries(humorTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([t]) => t)

  // Film
  const topFilmTypes = Object.entries(filmTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([t]) => t)
  const filmIntensity = toIntensity(Object.values(filmTypeCounts).reduce((a, b) => a + b, 0), total, 3)

  // TV
  const topTVTypes = Object.entries(tvTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([t]) => t)
  const tvIntensity = toIntensity(Object.values(tvTypeCounts).reduce((a, b) => a + b, 0), total, 3)

  // Music
  const musicIntensity = toIntensity(musicCount, total, 5)
  let musicEngagement: 'background' | 'casual' | 'enthusiast' | 'obsessed' = 'background'
  if (musicIntensity > 0.7) musicEngagement = 'obsessed'
  else if (musicIntensity > 0.4) musicEngagement = 'enthusiast'
  else if (musicIntensity > 0.15) musicEngagement = 'casual'
  const topGenres = Object.entries(musicGenreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([g]) => g)

  // Sports
  const primarySport = Object.entries(sportTypeCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'general'
  let sportsStyle: 'highlights' | 'analysis' | 'live' = 'highlights'
  if (sportsAnalysisCount > sportsHighlightsCount) sportsStyle = 'analysis'

  // Politics
  let politicsLean: 'left' | 'right' | 'centre' | 'none' = 'none'
  if (politicsCount > 0) {
    if (leftCount > rightCount * 1.5) politicsLean = 'left'
    else if (rightCount > leftCount * 1.5) politicsLean = 'right'
    else if (leftCount > 0 || rightCount > 0) politicsLean = 'centre'
  }

  // Tech
  let techStyle: 'consumer' | 'developer' | 'both' = 'consumer'
  if (developerCount > 0 && consumerTechCount > 0) techStyle = 'both'
  else if (developerCount > consumerTechCount) techStyle = 'developer'

  // Food
  let foodStyle: 'cooking' | 'watching' | 'both' = 'watching'
  if (cookingCount > foodCount * 0.5) foodStyle = 'cooking'
  else if (cookingCount > 0) foodStyle = 'both'

  // Travel style
  const primaryTravelStyle = Object.entries(travelStyleCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'general'

  // Pets
  const primaryPetType = Object.entries(petTypeCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] as 'cat' | 'dog' | 'both' | 'other' | 'none' || 'none'
  const hasCat = (petTypeCounts['cat'] || 0) > 0
  const hasDog = (petTypeCounts['dog'] || 0) > 0
  const petType = hasCat && hasDog ? 'both' : hasCat ? 'cat' : hasDog ? 'dog' : primaryPetType

  // Gaming
  const topGamingGenres = Object.entries(gamingGenreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([g]) => g)
  const gamingStyle = hardcoreGamingCount > gamingCount * 0.3 ? 'hardcore' : 'casual'

  // Finance
  const financeStyle = activeFinanceCount > financeCount * 0.4 ? 'active' : 'passive'

  return {
    language: {
      primary: primaryLanguage,
      multilingual,
      distribution: langDistribution,
    },
    humor: {
      intensity: toIntensity(comedyCount, total, 15),
      types: topHumorTypes,
    },
    pop_culture: {
      film: { intensity: filmIntensity, types: topFilmTypes },
      tv: { intensity: tvIntensity, types: topTVTypes },
      music: {
        intensity: toIntensity(musicCount, total, 15),
        engagement: musicEngagement,
        genres: topGenres,
      },
    },
    sports: {
      intensity: toIntensity(sportsCount, total, 10),
      primary: primarySport,
      style: sportsStyle,
    },
    politics: {
      intensity: toIntensity(politicsCount, total, 3),
      lean: politicsLean,
    },
    curiosity: toIntensity(curiosityCount, total, 8),
    tech: {
      intensity: toIntensity(techCount, total, 10),
      style: techStyle,
      ai_interest: toIntensity(aiCount, total, 5),
    },
    lifestyle: {
      fitness: toIntensity(fitnessCount, total, 8),
      food: {
        intensity: toIntensity(foodCount, total, 8),
        style: foodStyle,
      },
      travel: {
        intensity: toIntensity(travelCount, total, 8),
        style: primaryTravelStyle as 'budget' | 'luxury' | 'adventure' | 'general',
      },
    },
    pets: {
      intensity: toIntensity(petCount, total, 5),
      type: petType,
    },
    gaming: {
      intensity: toIntensity(gamingCount, total, 10),
      style: gamingStyle,
      genres: topGamingGenres,
    },
    finance: {
      intensity: toIntensity(financeCount, total, 5),
      style: financeStyle as 'passive' | 'active',
    },
  }
}

function getDefaults(): PersonalityDimensions {
  return {
    language: { primary: 'english', multilingual: false, distribution: { english: 1 } },
    humor: { intensity: 0, types: [] },
    pop_culture: {
      film: { intensity: 0, types: [] },
      tv: { intensity: 0, types: [] },
      music: { intensity: 0, engagement: 'background', genres: [] },
    },
    sports: { intensity: 0, primary: 'general', style: 'highlights' },
    politics: { intensity: 0, lean: 'none' },
    curiosity: 0,
    tech: { intensity: 0, style: 'consumer', ai_interest: 0 },
    lifestyle: {
      fitness: 0,
      food: { intensity: 0, style: 'watching' },
      travel: { intensity: 0, style: 'general' },
    },
    pets: { intensity: 0, type: 'none' },
    gaming: { intensity: 0, style: 'casual', genres: [] },
    finance: { intensity: 0, style: 'passive' },
  }
}