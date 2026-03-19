import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Member = {
  id: string;
  name: string;
  role: string;
  track: 'junior' | 'senior' | 'admin' | 'ob';
  semester: string;
  github?: string;
  linkedin?: string;
  avatar_url?: string;
  bio?: string;
  is_active: boolean;
  created_at: string;
  password_hash?: string;
  interests?: string[];
  workload?: number;
  status?: 'busy' | 'mid' | 'free';
  skills?: string[];
  looking_for_team?: boolean;
  project_idea?: string;
  contact_info?: string;
  contact_email?: string;
};

export type TeamApplication = {
  id: string;
  team_post_id: string;
  applicant_id: string | null;
  applicant_name: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  applicant?: Member;
};

export type TeamPost = {
  id: string;
  author_id: string | null;
  author_name?: string;
  title: string;
  description: string;
  required_skills: string[];
  max_members: number;
  current_members: number;
  status: 'open' | 'closed';
  contact: string | null;
  created_at: string;
  author?: Member;
  applications?: TeamApplication[];
};

export type Post = {
  id: string;
  title: string;
  content: string;
  author_id: string | null;
  author_name?: string;
  author_password?: string;
  category: 'notice' | 'activity' | 'study' | 'project';
  tags: string[];
  is_pinned: boolean;
  views: number;
  created_at: string;
  updated_at: string;
  author?: Member;
  comments?: Comment[];
};

export type Comment = {
  id: string;
  post_id: string;
  author_name: string;
  author_email?: string;
  content: string;
  is_approved: boolean;
  parent_id?: string;
  created_at: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export type Project = {
  id: string;
  title: string;
  description?: string;
  type: 'study' | 'project' | 'research' | 'competition';
  status: 'planned' | 'ongoing' | 'completed' | 'archived';
  semester?: string;
  start_date?: string;
  end_date?: string;
  tags: string[];
  github?: string;
  demo_url?: string;
  thumbnail_url?: string;
  outcome?: string;
  created_at: string;
  updated_at: string;
  project_members?: ProjectMember[];
};

export type ProjectMember = {
  id: string;
  project_id: string;
  member_id: string;
  role: string;
  joined_at: string;
  member?: Member;
};

export type Activity = {
  id: string;
  semester: string;
  title: string;
  type: 'study' | 'project' | 'competition' | 'seminar';
  description: string;
  tags: string[];
  github?: string;
  status: 'ongoing' | 'completed' | 'upcoming';
  created_at?: string;
  // New optional fields
  detail_url?: string;
  start_date?: string;
  end_date?: string;
  participants?: number;
  participants_type?: 'single' | 'min' | 'max' | 'range';
  participants_min?: number;
  participants_max?: number;
  result?: string;
  image_url?: string;
  detail_content?: string;
  slug?: string;
  instagram_url?: string;
};

export type ActivityAward = {
  id: string;
  activity_id: string;
  member_id: string;
  rank: '1st' | '2nd' | '3rd' | 'special' | 'participation';
  note?: string;
  created_at?: string;
  member?: Member;
};

export type OpsTeamMember = {
  id: string;
  name: string;
  role: string;
  responsibilities: string;
  level: 'president' | 'vp' | 'lead' | 'member';
  order: number;
  generation: number;
  avatar_url?: string;
  created_at?: string;
};

export type ExOpsMember = {
  id: string;
  name: string;
  role: string;
  generation: string;
  term: string;
  description: string;
  created_at?: string;
};
