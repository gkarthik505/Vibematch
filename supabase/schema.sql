-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  age integer not null check (age >= 18 and age <= 100),
  gender text not null,
  interested_in text not null,
  city text not null,
  onboarding_complete boolean default false,
  upload_complete boolean default false,
  created_at timestamptz default now()
);

-- Uploaded files table
create table if not exists uploaded_files (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  file_path text not null,
  parse_status text not null default 'pending', -- pending, processing, done, error
  created_at timestamptz default now()
);

-- Activity items (parsed watch history)
create table if not exists activity_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text,
  youtube_video_id text,
  canonical_url text,
  creator_name text,
  watched_at timestamptz,
  created_at timestamptz default now()
);

-- Representative videos (selected from activity)
create table if not exists representative_videos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  youtube_video_id text not null,
  title text,
  creator_name text,
  score float default 0,
  position integer not null,
  created_at timestamptz default now()
);

-- Taste profiles
create table if not exists taste_profiles (
  user_id uuid primary key references profiles(id) on delete cascade,
  top_topics jsonb default '[]',
  vibe_summary text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Swipes
create table if not exists swipes (
  id uuid primary key default uuid_generate_v4(),
  swiper_id uuid not null references profiles(id) on delete cascade,
  target_id uuid not null references profiles(id) on delete cascade,
  decision text not null check (decision in ('like', 'pass')),
  created_at timestamptz default now(),
  unique(swiper_id, target_id)
);

-- Matches
create table if not exists matches (
  id uuid primary key default uuid_generate_v4(),
  user_a uuid not null references profiles(id) on delete cascade,
  user_b uuid not null references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_a, user_b)
);

-- Row Level Security
alter table profiles enable row level security;
alter table uploaded_files enable row level security;
alter table activity_items enable row level security;
alter table representative_videos enable row level security;
alter table taste_profiles enable row level security;
alter table swipes enable row level security;
alter table matches enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can insert their own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- Allow viewing other profiles in discovery (only basic info needed)
create policy "Users can view other complete profiles"
  on profiles for select using (upload_complete = true);

-- Uploaded files policies
create policy "Users manage their own files"
  on uploaded_files for all using (auth.uid() = user_id);

-- Activity items policies
create policy "Users manage their own activity"
  on activity_items for all using (auth.uid() = user_id);

-- Representative videos: owners can manage, others can view
create policy "Users manage their own videos"
  on representative_videos for all using (auth.uid() = user_id);

create policy "Anyone can view representative videos"
  on representative_videos for select using (true);

-- Taste profiles: owners can manage, others can view
create policy "Users manage their own taste profile"
  on taste_profiles for all using (auth.uid() = user_id);

create policy "Anyone can view taste profiles"
  on taste_profiles for select using (true);

-- Swipes: users manage their own swipes
create policy "Users manage their own swipes"
  on swipes for all using (auth.uid() = swiper_id);

-- Matches: users can view matches they are in
create policy "Users can view their matches"
  on matches for select using (auth.uid() = user_a or auth.uid() = user_b);

create policy "Service can insert matches"
  on matches for insert with check (true);

-- Storage bucket for uploads
insert into storage.buckets (id, name, public) values ('uploads', 'uploads', false)
  on conflict do nothing;

create policy "Users upload their own files"
  on storage.objects for insert with check (
    bucket_id = 'uploads' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users read their own files"
  on storage.objects for select using (
    bucket_id = 'uploads' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users delete their own files"
  on storage.objects for delete using (
    bucket_id = 'uploads' and auth.uid()::text = (storage.foldername(name))[1]
  );
