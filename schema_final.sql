-- ============================================================
-- YourClub Website - Schema Final (통합본)
-- 모든 버전(v1~v11)을 하나로 통합한 최종 스키마
-- Supabase SQL Editor에서 전체 복붙 후 실행
-- ============================================================

-- Extensions
create extension if not exists pgcrypto;

-- ============================================================
-- TABLES
-- ============================================================

-- members
create table if not exists public.members (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  role text not null,
  track text not null check (track in ('junior', 'senior', 'admin', 'ob')),
  semester text not null,
  github text,
  linkedin text,
  instagram text,
  avatar_url text,
  bio text,
  project_idea text,
  interests text[] default '{}',
  workload int default 0 check (workload between 0 and 5),
  status text default 'mid' check (status in ('busy', 'mid', 'free')),
  looking_for_team boolean default false,
  password_hash text,
  is_active boolean default true,
  generation int,
  "order" int default 99,
  created_at timestamptz default now()
);

-- posts
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  author_id uuid references public.members(id) on delete set null,
  author_name text,
  category text not null check (category in ('notice', 'activity', 'study', 'project')),
  tags text[] default '{}',
  is_pinned boolean default false,
  views integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- comments
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade,
  author_name text not null,
  content text not null,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- activities
create table if not exists public.activities (
  id uuid default gen_random_uuid() primary key,
  slug text unique,
  title text not null,
  type text not null check (type in ('study', 'project', 'competition', 'seminar')),
  semester text not null,
  description text,
  detail_content text,
  detail_url text,
  instagram_url text,
  github text,
  tags text[] default '{}',
  status text default 'ongoing' check (status in ('ongoing', 'completed', 'upcoming')),
  start_date date,
  end_date date,
  participants int,
  participants_type text default 'single' check (participants_type in ('single', 'min', 'max', 'range')),
  participants_min int,
  participants_max int,
  result text,
  image_url text,
  created_at timestamptz default now()
);

-- projects
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  type text default 'project' check (type in ('study', 'project', 'competition', 'seminar')),
  semester text,
  tags text[] default '{}',
  github text,
  status text default 'ongoing' check (status in ('ongoing', 'completed', 'upcoming')),
  members text[] default '{}',
  start_date date,
  end_date date,
  image_url text,
  created_at timestamptz default now()
);

-- team_posts (팀원 모집)
create table if not exists public.team_posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  author_id uuid references public.members(id) on delete set null,
  author_name text,
  max_members int default 4,
  status text default 'open' check (status in ('open', 'closed')),
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- team_applications
create table if not exists public.team_applications (
  id uuid default gen_random_uuid() primary key,
  team_post_id uuid references public.team_posts(id) on delete cascade,
  applicant_id uuid references public.members(id) on delete cascade,
  applicant_name text,
  message text,
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz default now(),
  unique(team_post_id, applicant_id)
);

-- messages (contact form)
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  subject text,
  message text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- users (admin/ops 로그인)
create table if not exists public.users (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  password_hash text not null,
  role text not null check (role in ('admin', 'ops', 'member', 'ob')),
  member_id uuid references public.members(id) on delete set null,
  created_at timestamptz default now()
);

-- ops_team (운영진)
create table if not exists public.ops_team (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  role text not null,
  responsibilities text,
  level text default 'member' check (level in ('president', 'vp', 'lead', 'member')),
  "order" int default 99,
  generation int default 1,
  member_id uuid references public.members(id) on delete set null,
  created_at timestamptz default now()
);

-- ex_ops (전 운영진)
create table if not exists public.ex_ops (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  role text not null,
  generation int not null,
  track text,
  joined_at text,
  member_id uuid references public.members(id) on delete set null,
  created_at timestamptz default now()
);

-- activity_awards
create table if not exists public.activity_awards (
  id uuid default gen_random_uuid() primary key,
  member_id uuid references public.members(id) on delete cascade,
  title text not null,
  issuer text,
  date date,
  created_at timestamptz default now()
);

-- site_settings
create table if not exists public.site_settings (
  id uuid default gen_random_uuid() primary key,
  key text not null unique,
  value text,
  updated_at timestamptz default now()
);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================
alter table public.members enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.activities enable row level security;
alter table public.projects enable row level security;
alter table public.team_posts enable row level security;
alter table public.team_applications enable row level security;
alter table public.messages enable row level security;
alter table public.users enable row level security;
alter table public.ops_team enable row level security;
alter table public.ex_ops enable row level security;
alter table public.activity_awards enable row level security;
alter table public.site_settings enable row level security;

-- Public read policies
create policy if not exists "public read members" on public.members for select using (true);
create policy if not exists "public read posts" on public.posts for select using (true);
create policy if not exists "public read comments" on public.comments for select using (true);
create policy if not exists "public read activities" on public.activities for select using (true);
create policy if not exists "public read projects" on public.projects for select using (true);
create policy if not exists "public read team_posts" on public.team_posts for select using (true);
create policy if not exists "public read team_applications" on public.team_applications for select using (true);
create policy if not exists "public read ops_team" on public.ops_team for select using (true);
create policy if not exists "public read ex_ops" on public.ex_ops for select using (true);
create policy if not exists "public read activity_awards" on public.activity_awards for select using (true);
create policy if not exists "public read site_settings" on public.site_settings for select using (true);

-- Public insert policies (forms)
create policy if not exists "public insert messages" on public.messages for insert with check (true);
create policy if not exists "public insert comments" on public.comments for insert with check (true);
create policy if not exists "public insert team_applications" on public.team_applications for insert with check (true);

-- Anon full access for admin operations (service_role bypasses RLS)
create policy if not exists "anon all members" on public.members for all using (true) with check (true);
create policy if not exists "anon all posts" on public.posts for all using (true) with check (true);
create policy if not exists "anon all activities" on public.activities for all using (true) with check (true);
create policy if not exists "anon all projects" on public.projects for all using (true) with check (true);
create policy if not exists "anon all team_posts" on public.team_posts for all using (true) with check (true);
create policy if not exists "anon all ops_team" on public.ops_team for all using (true) with check (true);
create policy if not exists "anon all ex_ops" on public.ex_ops for all using (true) with check (true);
create policy if not exists "anon all activity_awards" on public.activity_awards for all using (true) with check (true);
create policy if not exists "anon all site_settings" on public.site_settings for all using (true) with check (true);
create policy if not exists "anon all users" on public.users for all using (true) with check (true);
create policy if not exists "anon all messages" on public.messages for all using (true) with check (true);
create policy if not exists "anon all comments" on public.comments for all using (true) with check (true);
create policy if not exists "anon all team_applications" on public.team_applications for all using (true) with check (true);

-- ============================================================
-- FUNCTIONS (bcrypt auth)
-- ============================================================
create or replace function check_user_password(p_name text, p_password text)
returns table (id uuid, name text, role text, member_id uuid)
language plpgsql security definer as $$
begin
  return query
    select u.id, u.name, u.role::text, u.member_id
    from public.users u
    where u.name = p_name
      and crypt(p_password, u.password_hash) = u.password_hash;
end;
$$;

create or replace function set_user_password(p_id uuid, p_new_password text)
returns void language plpgsql security definer as $$
begin
  update public.users
  set password_hash = crypt(p_new_password, gen_salt('bf', 10))
  where id = p_id;
end;
$$;

grant execute on function check_user_password(text, text) to anon, authenticated;
grant execute on function set_user_password(uuid, text) to authenticated;
