export interface Profile {
  id: string
  first_name: string
  age: number
  gender: string
  interested_in: string
  city: string
  onboarding_complete: boolean
  upload_complete: boolean
  created_at: string
}

export interface UploadedFile {
  id: string
  user_id: string
  file_path: string
  parse_status: 'pending' | 'processing' | 'done' | 'error'
  created_at: string
}

export interface ActivityItem {
  id?: string
  user_id?: string
  title: string
  youtube_video_id: string
  canonical_url: string
  creator_name: string
  watched_at: string | null
  created_at?: string
}

export interface RepresentativeVideo {
  id?: string
  user_id?: string
  youtube_video_id: string
  title: string
  creator_name: string
  score: number
  position: number
}

export interface TasteProfile {
  user_id?: string
  top_topics: string[]
  vibe_summary: string
}

export interface Swipe {
  id: string
  swiper_id: string
  target_id: string
  decision: 'like' | 'pass'
  created_at: string
}

export interface Match {
  id: string
  user_a: string
  user_b: string
  created_at: string
}

export interface DiscoveryUser {
  profile: Profile
  videos: RepresentativeVideo[]
  taste: TasteProfile
}

export type ParseResult = {
  items: ActivityItem[]
  warnings: string[]
}
