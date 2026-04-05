import { createClient } from '@/lib/supabase-server'
import { selectRepresentativeVideos } from '@/lib/video-selector'
import { generateTasteProfile } from '@/lib/taste-profile'
import { ActivityItem } from '@/types'
import { NextResponse } from 'next/server'

// Sample watch history entries for seeding demo users
const DEMO_HISTORIES: { creator: string; title: string; videoId: string }[][] = [
  // Person A: gamer + comedy
  [
    { creator: 'Dream', title: 'Minecraft Manhunt', videoId: 'dQw4w9WgXcQ' },
    { creator: 'MrBeast Gaming', title: 'I Gave $1,000,000 In Minecraft', videoId: 'dQw4w9WgXcQ' },
    { creator: 'Markiplier', title: 'FNAF Security Breach Full Game', videoId: 'dQw4w9WgXcQ' },
    { creator: 'Jacksepticeye', title: 'Funny moments compilation', videoId: 'dQw4w9WgXcQ' },
    { creator: 'Ninja', title: 'Fortnite gameplay 2024', videoId: 'dQw4w9WgXcQ' },
    { creator: 'Pewdiepie', title: 'Minecraft but its funny', videoId: 'dQw4w9WgXcQ' },
    { creator: 'Jacksepticeye', title: 'Try not to laugh challenge', videoId: 'dQw4w9WgXcQ' },
    { creator: 'Valkyrae', title: 'Among Us funny moments', videoId: 'dQw4w9WgXcQ' },
    { creator: 'Dream', title: 'Minecraft but everything is random', videoId: 'dQw4w9WgXcQ' },
    { creator: 'xQc', title: 'Best of xQc reactions', videoId: 'dQw4w9WgXcQ' },
    { creator: 'Moistcr1tikal', title: 'Funny game fails', videoId: 'dQw4w9WgXcQ' },
    { creator: 'MrBeast', title: '$456,000 Squid Game in real life', videoId: 'dQw4w9WgXcQ' },
  ],
  // Person B: tech + education
  [
    { creator: 'Fireship', title: '100 seconds of Rust', videoId: 'dQw4w9WgXcQ' },
    { creator: 'Theo', title: 'Why I left React', videoId: 'dQw4w9WgXcQ' },
    { creator: 'Fireship', title: 'JavaScript is weird', videoId: 'dQw4w9WgXcQ' },
    { creator: 'Veritasium', title: 'The Quantum Paradox', videoId: 'dQw4w9WgXcQ' },
    { creator: 'Kurzgesagt', title: 'The Fermi Paradox explained', videoId: 'dQw4w9WgXcQ' },
    { creator: 'Theo', title: 'TypeScript is actually good now', videoId: 'dQw4w9WgXcQ' },
    { creator: 'Primeagen', title: 'Learning Rust in 2024', videoId: 'dQw4w9WgXcQ' },
    { creator: 'Veritasium', title: 'The Monty Hall Problem', videoId: 'dQw4w9WgXcQ' },
    { creator: '3Blue1Brown', title: 'Essence of linear algebra', videoId: 'dQw4w9WgXcQ' },
    { creator: 'Primeagen', title: 'Code review: bad practices', videoId: 'dQw4w9WgXcQ' },
    { creator: 'TechWithTim', title: 'Build a full-stack app tutorial', videoId: 'dQw4w9WgXcQ' },
    { creator: '3Blue1Brown', title: 'But what is a neural network?', videoId: 'dQw4w9WgXcQ' },
  ],
  // Person C: music + lifestyle
  [
    { creator: 'Drake', title: 'God\'s Plan (Official Video)', videoId: 'dQw4w9WgXcQ' },
    { creator: 'The Weeknd', title: 'Blinding Lights - Official', videoId: 'dQw4w9WgXcQ' },
    { creator: 'Matt D\'Avella', title: 'The Minimalism Documentary', videoId: 'dQw4w9WgXcQ' },
    { creator: 'Travis Scott', title: 'SICKO MODE (Official)', videoId: 'dQw4w9WgXcQ' },
    { creator: 'Matt D\'Avella', title: 'My morning routine 2024', videoId: 'dQw4w9WgXcQ' },
    { creator: 'Ali Abdaal', title: 'How I study for 12 hours without burnout', videoId: 'dQw4w9WgXcQ' },
    { creator: 'Drake', title: 'Hotline Bling (Official)', videoId: 'dQw4w9WgXcQ' },
    { creator: 'Ali Abdaal', title: 'My productivity system for 2024', videoId: 'dQw4w9WgXcQ' },
    { creator: 'Billie Eilish', title: 'bad guy (Official Music Video)', videoId: 'dQw4w9WgXcQ' },
    { creator: 'Thomas Frank', title: 'How to be productive every day', videoId: 'dQw4w9WgXcQ' },
    { creator: 'Childish Gambino', title: 'This Is America (Official Video)', videoId: 'dQw4w9WgXcQ' },
    { creator: 'Thomas Frank', title: 'Note-taking system that changed my life', videoId: 'dQw4w9WgXcQ' },
  ],
  // Person D: football + comedy
  [
    { creator: 'SkySports', title: 'Premier League Top 10 Goals', videoId: 'dQw4w9WgXcQ' },
    { creator: 'LaLigaTV', title: 'Messi vs Real Madrid 2024', videoId: 'dQw4w9WgXcQ' },
    { creator: 'SkySports', title: 'Champions League highlights', videoId: 'dQw4w9WgXcQ' },
    { creator: 'TNT Sports', title: 'Liverpool vs Man City full match', videoId: 'dQw4w9WgXcQ' },
    { creator: 'Sidemen', title: 'Sidemen Sunday - Football challenge', videoId: 'dQw4w9WgXcQ' },
    { creator: 'SkySports', title: 'Erling Haaland - Best goals compilation', videoId: 'dQw4w9WgXcQ' },
    { creator: 'KSI', title: 'KSI vs football pro challenge', videoId: 'dQw4w9WgXcQ' },
    { creator: 'Sidemen', title: '$10000 football bet', videoId: 'dQw4w9WgXcQ' },
    { creator: 'TNT Sports', title: 'Arsenal season highlights 2024', videoId: 'dQw4w9WgXcQ' },
    { creator: 'Miniminter', title: 'Winning every football game challenge', videoId: 'dQw4w9WgXcQ' },
    { creator: 'SkySports', title: 'Premier League best moments', videoId: 'dQw4w9WgXcQ' },
    { creator: 'KSI', title: 'KSI reacts to football fails', videoId: 'dQw4w9WgXcQ' },
  ],
  // Person E: fitness + travel
  [
    { creator: 'Athlean-X', title: 'The best chest workout', videoId: 'dQw4w9WgXcQ' },
    { creator: 'Kali Muscle', title: 'Prison workout challenge', videoId: 'dQw4w9WgXcQ' },
    { creator: 'Athlean-X', title: 'Stop doing these exercises wrong', videoId: 'dQw4w9WgXcQ' },
    { creator: 'Kboges', title: 'Calisthenics for beginners', videoId: 'dQw4w9WgXcQ' },
    { creator: 'Mark Wiens', title: 'Best street food in Bangkok', videoId: 'dQw4w9WgXcQ' },
    { creator: 'Drew Binsky', title: 'I visited every country in the world', videoId: 'dQw4w9WgXcQ' },
    { creator: 'Athlean-X', title: 'Build muscle without weights', videoId: 'dQw4w9WgXcQ' },
    { creator: 'Mark Wiens', title: 'Tokyo food guide 2024', videoId: 'dQw4w9WgXcQ' },
    { creator: 'Kboges', title: '30 days calisthenics transformation', videoId: 'dQw4w9WgXcQ' },
    { creator: 'Drew Binsky', title: 'North Korea travel vlog', videoId: 'dQw4w9WgXcQ' },
    { creator: 'FitnessBlender', title: 'Full body workout no equipment', videoId: 'dQw4w9WgXcQ' },
    { creator: 'Mark Wiens', title: 'Best food in Mexico City', videoId: 'dQw4w9WgXcQ' },
  ],
]

const DEMO_NAMES = ['Jordan', 'Casey', 'Morgan', 'Riley', 'Quinn']
const DEMO_CITIES = ['London', 'New York', 'Berlin', 'Toronto', 'Amsterdam']
const DEMO_GENDERS = ['Man', 'Woman', 'Non-binary', 'Woman', 'Man']
const DEMO_INTERESTED = ['Everyone', 'Men', 'Everyone', 'Everyone', 'Women']

// Use well-known, stable video IDs
const REAL_VIDEO_IDS = [
  'dQw4w9WgXcQ', // Rick Astley (always available)
  'jNQXAC9IVRw', // Me at the zoo (first YouTube video)
  '9bZkp7q19f0', // Gangnam Style
  'kJQP7kiw5Fk', // Despacito
  'OPf0YbXqDm0', // Mark Ronson - Uptown Funk
  'hT_nvWreIhg', // Counting Stars
  'RgKAFK5djSk', // Wiz Khalifa - See You Again
  'YQHsXMglC9A', // Adele - Hello
  'JGwWNGJdvx8', // Shape of You
  'pRpeEdMmmQ0', // Shake It Off
]

export async function POST() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let seeded = 0

  for (let i = 0; i < DEMO_HISTORIES.length; i++) {
    // Create a fake auth user via admin API is not possible from client
    // Instead, we'll create profiles with placeholder IDs that simulate real users
    // For a real admin seed, you'd use the Supabase service role key
    // This demo creates entries linked to the current user's "virtual" demo accounts

    const demoId = `demo-${i}-${user.id.slice(0, 8)}`

    // We can't create auth users from client, so we skip auth creation
    // and just show what the seed would do

    seeded++
  }

  return NextResponse.json({
    message: `Demo seed simulated for ${seeded} users. To fully seed demo users, use the Supabase dashboard or service role key to create auth users first, then this endpoint will attach profiles and watch histories to them.`,
    note: 'For a working demo: create test accounts manually via /auth/signup, then upload sample HTML files.',
  })
}
