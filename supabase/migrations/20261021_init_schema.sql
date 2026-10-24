-- ==============================================================================
-- ArogyaMitra AI — Complete Supabase PostgreSQL Schema with Row Level Security
-- ==============================================================================

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  email text,
  preferred_language text default 'en' check (preferred_language in ('en', 'mr', 'hi', 'kn')),
  birth_year integer check (birth_year >= 1900 and birth_year <= 2100),
  region text default 'India',
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. USER PREFERENCES TABLE
create table if not exists public.user_preferences (
  user_id uuid references auth.users(id) on delete cascade primary key,
  compact_cards boolean default false not null,
  notifications_enabled boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. CHAT CONVERSATIONS TABLE
create table if not exists public.chat_conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'New Conversation',
  language text default 'en' check (language in ('en', 'mr', 'hi', 'kn')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. CHAT MESSAGES TABLE
create table if not exists public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.chat_conversations(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. VACCINATION REMINDERS TABLE
create table if not exists public.vaccination_reminders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  recipient_name text not null,
  vaccine_name text not null,
  planned_date date not null,
  is_completed boolean default false not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. EMERGENCY CONTACTS TABLE
create table if not exists public.emergency_contacts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  phone text not null,
  relationship text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. HEALTH ARTICLES TABLE (Public Educational Content)
create table if not exists public.health_articles (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  category text not null check (category in ('Conditions', 'Wellness', 'Nutrition', 'Prevention', 'Mental Wellness', 'First Aid')),
  summary text not null,
  content text not null,
  image_url text,
  language text default 'en' not null,
  source_name text not null,
  source_url text,
  reviewed_date date default current_date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. SAVED ARTICLES (Bookmarks) TABLE
create table if not exists public.saved_articles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  article_id uuid references public.health_articles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, article_id)
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
create index if not exists idx_chat_conversations_user on public.chat_conversations(user_id);
create index if not exists idx_chat_messages_conv on public.chat_messages(conversation_id);
create index if not exists idx_vaccination_reminders_user on public.vaccination_reminders(user_id);
create index if not exists idx_emergency_contacts_user on public.emergency_contacts(user_id);
create index if not exists idx_saved_articles_user on public.saved_articles(user_id);
create index if not exists idx_health_articles_category on public.health_articles(category);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;
alter table public.vaccination_reminders enable row level security;
alter table public.emergency_contacts enable row level security;
alter table public.health_articles enable row level security;
alter table public.saved_articles enable row level security;

-- PROFILES Policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- USER PREFERENCES Policies
create policy "Users can view own preferences" on public.user_preferences
  for select using (auth.uid() = user_id);

create policy "Users can insert own preferences" on public.user_preferences
  for insert with check (auth.uid() = user_id);

create policy "Users can update own preferences" on public.user_preferences
  for update using (auth.uid() = user_id);

-- CHAT CONVERSATIONS Policies
create policy "Users can view own conversations" on public.chat_conversations
  for select using (auth.uid() = user_id);

create policy "Users can insert own conversations" on public.chat_conversations
  for insert with check (auth.uid() = user_id);

create policy "Users can update own conversations" on public.chat_conversations
  for update using (auth.uid() = user_id);

create policy "Users can delete own conversations" on public.chat_conversations
  for delete using (auth.uid() = user_id);

-- CHAT MESSAGES Policies
create policy "Users can view messages of own conversations" on public.chat_messages
  for select using (auth.uid() = user_id);

create policy "Users can insert messages into own conversations" on public.chat_messages
  for insert with check (auth.uid() = user_id);

-- VACCINATION REMINDERS Policies
create policy "Users can view own vaccination reminders" on public.vaccination_reminders
  for select using (auth.uid() = user_id);

create policy "Users can insert own vaccination reminders" on public.vaccination_reminders
  for insert with check (auth.uid() = user_id);

create policy "Users can update own vaccination reminders" on public.vaccination_reminders
  for update using (auth.uid() = user_id);

create policy "Users can delete own vaccination reminders" on public.vaccination_reminders
  for delete using (auth.uid() = user_id);

-- EMERGENCY CONTACTS Policies
create policy "Users can view own emergency contacts" on public.emergency_contacts
  for select using (auth.uid() = user_id);

create policy "Users can insert own emergency contacts" on public.emergency_contacts
  for insert with check (auth.uid() = user_id);

create policy "Users can update own emergency contacts" on public.emergency_contacts
  for update using (auth.uid() = user_id);

create policy "Users can delete own emergency contacts" on public.emergency_contacts
  for delete using (auth.uid() = user_id);

-- HEALTH ARTICLES Policies (Public educational articles readable by all)
create policy "Health articles are publicly readable" on public.health_articles
  for select using (true);

-- SAVED ARTICLES Policies
create policy "Users can view own saved articles" on public.saved_articles
  for select using (auth.uid() = user_id);

create policy "Users can insert own saved articles" on public.saved_articles
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own saved articles" on public.saved_articles
  for delete using (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, preferred_language)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'preferred_language', 'en')
  );

  insert into public.user_preferences (user_id, compact_cards, notifications_enabled)
  values (new.id, false, false);

  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==============================================================================
-- INITIAL VERIFIED HEALTH ARTICLES SEED DATA
-- ==============================================================================
insert into public.health_articles (slug, title, category, summary, content, image_url, source_name, source_url, reviewed_date)
values
(
  'understanding-diabetes',
  'Understanding Diabetes: Types, Symptoms, and Management',
  'Conditions',
  'Diabetes affects how your body processes glucose. Learn about early warning signs, lifestyle interventions, and monitoring.',
  'Diabetes mellitus is a metabolic condition characterised by elevated blood glucose levels. In Type 1 diabetes, the body produces little or no insulin. In Type 2 diabetes, cells become resistant to insulin or the pancreas does not produce sufficient amounts. Common symptoms include increased thirst (polydipsia), frequent urination (polyuria), unexplained fatigue, and blurred vision. Managing diabetes involves balanced nutrition, regular physical activity, monitoring blood sugar, and adhering to prescribed medical therapies under the guidance of a physician.',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
  'World Health Organization (WHO)',
  'https://www.who.int/news-room/fact-sheets/detail/diabetes',
  '2026-01-15'
),
(
  'how-to-sleep-better',
  'The Science of Restorative Sleep: Evidence-Based Tips',
  'Wellness',
  'Quality sleep is essential for immune health, cognitive performance, and cardiovascular wellness.',
  'Sleep plays a vital role in biological repair and memory consolidation. Adults generally need 7 to 9 hours of quality sleep per night. Effective sleep hygiene includes maintaining a consistent wake-up time, keeping the bedroom dark and cool, avoiding heavy meals and caffeine 6 hours before bedtime, and limiting exposure to blue light from screens. If insomnia or daytime sleepiness persists for more than three weeks, seek medical evaluation for conditions such as obstructive sleep apnea.',
  'https://images.unsplash.com/photo-1511295742362-92c96b6d4f6d?w=800',
  'Ministry of Health and Family Welfare (India)',
  'https://main.mohfw.gov.in',
  '2026-02-10'
),
(
  'understanding-blood-pressure',
  'Understanding Blood Pressure and Cardiovascular Health',
  'Conditions',
  'High blood pressure often has no symptoms. Discover standard ranges, screening recommendations, and heart-healthy habits.',
  'Blood pressure is the force exerted by circulating blood against the walls of the body’s arteries. A normal reading for healthy adults is typically around 120/80 mmHg. Hypertension (high blood pressure) is often termed the "silent killer" because it can damage arteries, kidneys, and the heart without causing noticeable warning signs. Regular blood pressure screening, reducing sodium intake, engaging in aerobic exercise, and avoiding tobacco are key preventive measures.',
  'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800',
  'World Health Organization (WHO)',
  'https://www.who.int/health-topics/hypertension',
  '2026-03-01'
),
(
  'healthy-eating-basics',
  'Healthy Eating Basics: Balanced Nutrition for Indian Diets',
  'Nutrition',
  'Explore dietary guidelines for diverse nutritional needs, whole grains, pulses, and micronutrient balance.',
  'A balanced diet delivers macro- and micro-nutrients essential for sustaining cellular health and energy. Emphasize varied seasonal vegetables, whole grains (millets, brown rice, whole wheat), pulses, lentils, and healthy fats. Minimize ultra-processed foods, refined sugars, and trans-fats. Individual dietary requirements vary depending on life stage, level of physical exertion, and pre-existing medical conditions.',
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800',
  'National Institute of Nutrition (ICMR-NIN)',
  'https://www.nin.res.in',
  '2026-02-20'
),
(
  'why-vaccination-matters',
  'Universal Immunisation: How Vaccines Protect Communities',
  'Prevention',
  'Vaccines train the immune system to safely fight pathogens. Learn about herd immunity and national schedules.',
  'Vaccination is one of global public health’s most impactful interventions. Vaccines expose the immune system to harmless antigens or weakened components, inducing antibody production and immunological memory without causing the active disease. Following the Universal Immunisation Programme (UIP) safeguards infants, adolescents, pregnant mothers, and older adults from preventable infectious diseases.',
  'https://images.unsplash.com/photo-1618015358954-3c9b3f45e1e7?w=800',
  'Ministry of Health and Family Welfare (India) - UIP',
  'https://nhm.gov.in',
  '2026-01-28'
),
(
  'everyday-stress-management',
  'Everyday Stress Management and Mental Resilience',
  'Mental Wellness',
  'Practical strategies to cope with acute stress, foster mental clarity, and recognise when to seek professional help.',
  'Chronic stress triggers prolonged release of cortisol and adrenaline, contributing to hypertension, gastrointestinal distress, and sleep disruption. Useful coping techniques include structured box breathing (4-4-4-4 count), brief daily walks in nature, social connection with trusted friends, and time boundary setting. For persistent anxiety or depression, contacting a qualified counselor or tele-mental health services like Tele-MANAS (14416) is highly recommended.',
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
  'Tele-MANAS (Govt. of India)',
  'https://telemanas.mohfw.gov.in',
  '2026-03-12'
)
on conflict (slug) do nothing;
