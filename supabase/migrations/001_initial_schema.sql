-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  phone text,
  language text default 'en', -- 'en' or 'hi'
  subscription_tier text default 'free', -- 'free', 'core', 'premium'
  subscription_expires_at timestamptz,
  created_at timestamptz default now()
);

-- Family Profiles
create table public.family_profiles (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) on delete cascade,
  family_name text not null,
  city text,
  created_at timestamptz default now()
);

-- Family Members (kids, seniors, etc.)
create table public.family_members (
  id uuid default uuid_generate_v4() primary key,
  family_id uuid references public.family_profiles(id) on delete cascade,
  name text not null,
  age integer not null,
  gender text, -- 'male', 'female', 'other'
  role text, -- 'parent', 'child', 'senior'
  goal text, -- 'weight_loss', 'muscle_gain', 'general_fitness', 'energy_boost'
  medical_conditions text[], -- ['diabetes', 'bp', 'joint_pain']
  height_cm float,
  weight_kg float,
  created_at timestamptz default now()
);

-- Indian Food Database
create table public.food_items (
  id uuid default uuid_generate_v4() primary key,
  name_en text not null,
  name_hi text,
  category text, -- 'dal', 'sabzi', 'roti', 'rice', 'snack', 'beverage'
  calories_per_100g float,
  protein_g float,
  carbs_g float,
  fat_g float,
  fiber_g float,
  is_indian boolean default true,
  region text, -- 'north', 'south', 'east', 'west', 'pan-india'
  barcode text,
  created_at timestamptz default now()
);

-- Daily Food Logs
create table public.food_logs (
  id uuid default uuid_generate_v4() primary key,
  member_id uuid references public.family_members(id) on delete cascade,
  food_item_id uuid references public.food_items(id),
  meal_type text, -- 'breakfast', 'lunch', 'dinner', 'snack'
  quantity_g float,
  calories float,
  protein_g float,
  carbs_g float,
  fat_g float,
  logged_at date default current_date,
  created_at timestamptz default now()
);

-- Workout Sessions
create table public.workout_sessions (
  id uuid default uuid_generate_v4() primary key,
  member_id uuid references public.family_members(id) on delete cascade,
  workout_type text, -- 'weight_loss', 'muscle_gain', 'family', 'morning_routine'
  duration_minutes integer,
  exercises jsonb, -- [{name, sets, reps, weight_kg}]
  calories_burned float,
  is_family_workout boolean default false,
  logged_at date default current_date,
  created_at timestamptz default now()
);

-- Daily Health Logs (water, sleep, mood, steps)
create table public.daily_health_logs (
  id uuid default uuid_generate_v4() primary key,
  member_id uuid references public.family_members(id) on delete cascade,
  water_ml integer,
  sleep_hours float,
  steps integer,
  mood_score integer check (mood_score between 1 and 10),
  stress_level integer check (stress_level between 1 and 10),
  meditation_done boolean default false,
  logged_at date default current_date,
  created_at timestamptz default now(),
  unique(member_id, logged_at)
);

-- Personal Health Scores (calculated daily)
create table public.health_scores (
  id uuid default uuid_generate_v4() primary key,
  member_id uuid references public.family_members(id) on delete cascade,
  family_id uuid references public.family_profiles(id) on delete cascade,
  score_date date default current_date,
  nutrition_score float default 0,
  activity_score float default 0,
  consistency_score float default 0,
  sleep_score float default 0,
  hydration_score float default 0,
  mental_score float default 0,
  family_sync_score float default 0,
  total_phs float default 0,
  total_fhs float default 0,
  created_at timestamptz default now(),
  unique(member_id, score_date)
);

-- Badges
create table public.badges (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  icon text,
  criteria jsonb
);

create table public.member_badges (
  id uuid default uuid_generate_v4() primary key,
  member_id uuid references public.family_members(id),
  badge_id uuid references public.badges(id),
  earned_at timestamptz default now()
);

-- Fitness Test Assessments
create table public.assessments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id),
  answers jsonb not null, -- {q1: 'a', q2: 'b', ...}
  total_score integer,
  level text, -- 'beginner', 'intermediate', 'advanced'
  goal text,
  report_data jsonb,
  created_at timestamptz default now()
);

-- Streak Tracker
create table public.streaks (
  id uuid default uuid_generate_v4() primary key,
  member_id uuid references public.family_members(id),
  streak_type text, -- 'workout', 'nutrition', 'water', 'sleep'
  current_streak integer default 0,
  longest_streak integer default 0,
  last_logged_at date
);

-- Weight Progress
create table public.weight_logs (
  id uuid default uuid_generate_v4() primary key,
  member_id uuid references public.family_members(id),
  weight_kg float not null,
  logged_at date default current_date,
  notes text
);

-- Subscriptions
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id),
  razorpay_subscription_id text,
  plan text not null, -- 'core', 'premium'
  status text, -- 'active', 'cancelled', 'expired'
  amount_inr integer,
  started_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- Row-Level Security
alter table public.profiles enable row level security;
alter table public.family_members enable row level security;
alter table public.food_logs enable row level security;
alter table public.daily_health_logs enable row level security;
alter table public.health_scores enable row level security;

-- RLS Policies (users can only see their own data)
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
