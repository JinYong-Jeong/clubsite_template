import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Github, Mail, MessageCircle, Users, ChevronLeft, Pencil, Code2, ExternalLink, Trophy } from 'lucide-react';
import { supabase, Member, ActivityAward, Activity, Project, TeamPost } from '../lib/supabase';

const TRACK_LABELS: Record<string, string> = {
  junior: 'Junior',
  senior: 'Senior',
  admin: 'Admin',
  ob: 'OB',
};

const TRACK_COLORS: Record<string, string> = {
  junior: 'text-aing-blue border-blue-200 bg-aing-blue-light',
  senior: 'text-purple-500 border-purple-200 bg-purple-50',
  admin: 'text-green-500 border-green-200 bg-green-50',
  ob: 'text-gray-500 border-gray-200 bg-gray-50',
};

const STATUS_LABELS: Record<string, string> = {
  busy: '바쁨',
  mid: '프로젝트 관심',
  free: '프로젝트 희망',
};

const STATUS_COLORS: Record<string, string> = {
  busy: 'bg-red-100 text-red-700 border-red-200',
  mid: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  free: 'bg-green-100 text-green-700 border-green-200',
};

const WORKLOAD_COLORS = [
  'bg-green-400',
  'bg-green-400',
  'bg-yellow-400',
  'bg-yellow-400',
  'bg-orange-400',
  'bg-red-400',
];

const WORKLOAD_LABELS = ['여유', '여유', '보통', '보통', '바쁨', '매우 바쁨'];

const MemberDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [member, setMember] = useState<Member | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamPosts, setTeamPosts] = useState<Pick<TeamPost, 'id' | 'title' | 'status' | 'created_at'>[]>([]);
  const [awards, setAwards] = useState<(ActivityAward & { activity?: Activity })[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchMember = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .eq('id', id)
          .single();
        if (error || !data) {
          setNotFound(true);
        } else {
          setMember(data);
          // Fetch participated projects
          try {
            const { data: pmData } = await supabase
              .from('project_members')
              .select('project:projects(*)')
              .eq('member_id', id);
            if (pmData && pmData.length > 0) {
              const fetchedProjects = (pmData as unknown as { project: Project }[])
                .map(pm => pm.project)
                .filter(Boolean);
              setProjects(fetchedProjects);
            }
          } catch {
            // projects fetch failed silently
          }

          // Fetch team posts by author_id
          try {
            let teamPostsData: Pick<TeamPost, 'id' | 'title' | 'status' | 'created_at'>[] = [];
            const { data: tpById } = await supabase
              .from('team_posts')
              .select('id, title, status, created_at')
              .eq('author_id', id)
              .order('created_at', { ascending: false });
            if (tpById && tpById.length > 0) {
              teamPostsData = tpById;
            } else {
              // fallback: author_name match
              const { data: tpByName } = await supabase
                .from('team_posts')
                .select('id, title, status, created_at')
                .ilike('author_name', data.name)
                .order('created_at', { ascending: false });
              if (tpByName) teamPostsData = tpByName;
            }
            setTeamPosts(teamPostsData);
          } catch {
            // team posts fetch failed silently
          }
          try {
            const { data: awardsData } = await supabase
              .from('activity_awards')
              .select('*, activity:activities(*)')
              .eq('member_id', id);
            if (awardsData) setAwards(awardsData as any);
          } catch {}
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchMember();
  }, [id]);

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  if (loading) {
    return (
      <div className="min-h-screen bg-aing-bg pt-20 flex items-center justify-center">
        <div className="text-aing-muted text-sm">불러오는 중...</div>
      </div>
    );
  }

  if (notFound || !member) {
    return (
      <div className="min-h-screen bg-aing-bg pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold text-gradient mb-4">404</div>
          <p className="text-aing-muted mb-6">멤버를 찾을 수 없습니다.</p>
          <Link to="/members" className="btn-primary text-sm">멤버 목록으로</Link>
        </div>
      </div>
    );
  }

  const workload = member.workload ?? 0;
  const status = member.status ?? 'free';

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Back */}
        <Link
          to="/members"
          className="inline-flex items-center gap-1 text-aing-muted hover:text-aing-text text-sm mb-8 transition-colors"
        >
          <ChevronLeft size={14} />
          멤버 목록
        </Link>

        {/* Card */}
        <div className="bg-aing-card border border-aing-border rounded-2xl p-8">
          {/* Header */}
          <div className="flex items-start gap-5 mb-8">
            {member.avatar_url ? (
              <img
                src={member.avatar_url}
                alt={member.name}
                className="w-20 h-20 rounded-2xl object-cover border border-aing-border"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 border border-aing-border flex items-center justify-center shrink-0">
                <span className="text-aing-text font-semibold text-2xl">
                  {getInitials(member.name)}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-xl font-bold text-aing-text">{member.name}</h1>
                {member.looking_for_team && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 font-medium flex items-center gap-1">
                    <Users size={10} />
                    팀원 구하는 중
                  </span>
                )}
              </div>
              <p className="text-aing-muted text-sm mb-3">{member.role}</p>
              <div className="flex flex-wrap gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full border font-mono ${TRACK_COLORS[member.track]}`}>
                  {TRACK_LABELS[member.track]}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full border border-aing-border text-aing-muted font-mono">
                  {member.semester}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[status]}`}>
                  {STATUS_LABELS[status]}
                </span>
              </div>
            </div>
            <Link
              to={`/members/${member.id}/edit`}
              className="text-aing-muted hover:text-aing-text transition-colors p-1"
              title="프로필 수정"
            >
              <Pencil size={14} />
            </Link>
          </div>

          {/* Bio */}
          {member.bio && (
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-aing-muted uppercase tracking-wider mb-2">소개</h2>
              <p className="text-aing-text text-sm leading-relaxed">{member.bio}</p>
            </div>
          )}

          {/* Interests */}
          {member.interests && member.interests.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-aing-muted uppercase tracking-wider mb-2">관심 분야</h2>
              <div className="flex flex-wrap gap-2">
                {member.interests.map((tag, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-aing-blue border border-blue-200">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {member.skills && member.skills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-aing-muted uppercase tracking-wider mb-2">기술 스택</h2>
              <div className="flex flex-wrap gap-2">
                {member.skills.map((tag, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-200">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Workload */}
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-aing-muted uppercase tracking-wider mb-2">
              업무 포화도 — {WORKLOAD_LABELS[workload]}
            </h2>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    i < workload ? WORKLOAD_COLORS[workload] : 'bg-aing-border'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Project Idea */}
          {member.looking_for_team && member.project_idea && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <h2 className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">프로젝트 아이디어</h2>
              <p className="text-aing-text text-sm leading-relaxed">{member.project_idea}</p>
            </div>
          )}

          {/* Links */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-aing-border">
            {member.github && (
              <a
                href={member.github}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-sm text-aing-muted hover:text-aing-text transition-colors"
              >
                <Github size={14} />
                GitHub
              </a>
            )}
            {member.linkedin && (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-sm text-aing-muted hover:text-blue-600 transition-colors"
              >
                <ExternalLink size={14} />
                LinkedIn
              </a>
            )}
            {member.contact_info && (
              <a
                href={member.contact_info.startsWith('http') ? member.contact_info : `#`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-sm text-aing-muted hover:text-yellow-600 transition-colors"
              >
                <MessageCircle size={14} />
                연락수단
              </a>
            )}
            {member.contact_email && (
              <a
                href={`mailto:${member.contact_email}`}
                className="flex items-center gap-1.5 text-sm text-aing-muted hover:text-aing-text transition-colors"
              >
                <Mail size={14} />
                {member.contact_email}
              </a>
            )}
          </div>
        </div>

        {/* Participated Projects */}
        {awards.length > 0 && (
          <div className="mt-6 bg-aing-card border border-aing-border rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-aing-text mb-4 flex items-center gap-2">
              <Trophy size={14} className="text-amber-500" />수상 내역
            </h2>
            <div className="space-y-2">
              {awards.map(aw => (
                <div key={aw.id} className="flex items-center gap-3 p-3 rounded-xl border border-aing-border bg-white">
                  <span className="text-lg">{aw.rank==='1st'?'🥇':aw.rank==='2nd'?'🥈':aw.rank==='3rd'?'🥉':aw.rank==='special'?'🏅':'🎖️'}</span>
                  <div>
                    <p className="text-sm font-medium text-aing-text">{(aw as any).activity?.title || '활동'}</p>
                    <p className="text-xs text-aing-muted">
                      {aw.rank==='1st'?'1st Place':aw.rank==='2nd'?'2nd Place':aw.rank==='3rd'?'3rd Place':aw.rank==='special'?'특별상':'참가상'}
                      {aw.note && ` · ${aw.note}`}
                      {(aw as any).activity?.semester && ` · ${(aw as any).activity.semester}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Participated Projects */}
        {projects.length > 0 && (
          <div className="mt-6 bg-aing-card border border-aing-border rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-aing-text mb-4 flex items-center gap-2">
              <Code2 size={14} className="text-aing-blue" />
              참여 프로젝트 ({projects.length})
            </h2>
            <div className="space-y-3">
              {projects.map(project => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-aing-border hover:border-blue-200 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-aing-text truncate">{project.title}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-aing-muted">{project.type}</span>
                      {project.semester && <span className="text-xs text-aing-muted">· {project.semester}</span>}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                    project.status === 'ongoing' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                    project.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
                    'bg-gray-100 text-gray-500 border-gray-200'
                  }`}>
                    {project.status === 'ongoing' ? '진행중' : project.status === 'completed' ? '완료' : project.status}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Team Posts */}
        {teamPosts.length > 0 && (
          <div className="mt-6 bg-aing-card border border-aing-border rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-aing-text mb-4 flex items-center gap-2">
              <Users size={14} className="text-aing-blue" />
              팀원 모집 ({teamPosts.length})
            </h2>
            <div className="space-y-3">
              {teamPosts.map(tp => (
                <Link
                  key={tp.id}
                  to={`/team/${tp.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-aing-border hover:border-blue-200 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-aing-text truncate">{tp.title}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                    tp.status === 'open'
                      ? 'bg-green-100 text-green-700 border-green-200'
                      : 'bg-gray-100 text-gray-500 border-gray-200'
                  }`}>
                    {tp.status === 'open' ? '모집중' : '마감'}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberDetailPage;
