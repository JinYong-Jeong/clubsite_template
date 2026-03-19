import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Github, ExternalLink, ChevronLeft, BookOpen, Code2, Beaker, Trophy, Clock, Users } from 'lucide-react';
import { supabase, Project, ProjectMember } from '../lib/supabase';
import AnimatedSection from '../components/AnimatedSection';

const TYPE_ICONS: Record<string, React.ElementType> = {
  study: BookOpen,
  project: Code2,
  research: Beaker,
  competition: Trophy,
};

const TYPE_COLORS: Record<string, string> = {
  study: 'text-aing-blue border-blue-200 bg-aing-blue-light',
  project: 'text-purple-500 border-purple-200 bg-purple-50',
  research: 'text-green-500 border-green-200 bg-green-50',
  competition: 'text-orange-500 border-orange-200 bg-orange-50',
};

const STATUS_COLORS: Record<string, string> = {
  planned: 'bg-gray-100 text-gray-600 border-gray-200',
  ongoing: 'bg-blue-100 text-blue-700 border-blue-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  archived: 'bg-gray-100 text-gray-500 border-gray-200',
};

const STATUS_LABELS: Record<string, string> = {
  planned: '진행예정',
  ongoing: '진행중',
  completed: '완료',
  archived: '아카이브',
};

const ROLE_COLORS: Record<string, string> = {
  leader: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  member: 'bg-gray-50 text-gray-600 border-gray-200',
};

const demoProject: Project = {
  id: '1',
  title: 'ResNet Study',
  description: 'ResNet-50 논문 분석 및 PyTorch 직접 구현. He et al. (2015) 논문을 처음부터 끝까지 분석하고 직접 구현합니다.',
  type: 'study',
  status: 'ongoing',
  semester: '2026 Spring',
  tags: ['CV', 'ResNet', 'PyTorch'],
  github: 'https://github.com/yourclub-github/26-Spring-ResNet-Study',
  created_at: '2026-03-01T00:00:00Z',
  updated_at: '2026-03-01T00:00:00Z',
  project_members: [],
};

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchProject = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*, project_members(*, member:members(id, name, avatar_url, role, track))')
          .eq('id', id)
          .single();
        if (error || !data) {
          // Try demo
          if (id === '1') {
            setProject(demoProject);
            setMembers([]);
          } else {
            setNotFound(true);
          }
        } else {
          setProject(data as Project);
          setMembers((data as Project).project_members ?? []);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-aing-bg pt-20 flex items-center justify-center">
        <div className="text-aing-muted text-sm">불러오는 중...</div>
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="min-h-screen bg-aing-bg pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold text-gradient mb-4">404</div>
          <p className="text-aing-muted mb-6">프로젝트를 찾을 수 없습니다.</p>
          <Link to="/projects" className="btn-primary text-sm">프로젝트 목록으로</Link>
        </div>
      </div>
    );
  }

  const TypeIcon = TYPE_ICONS[project.type] || Code2;

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Back */}
        <Link
          to="/projects"
          className="inline-flex items-center gap-1 text-aing-muted hover:text-aing-text text-sm mb-8 transition-colors"
        >
          <ChevronLeft size={14} />
          프로젝트 목록
        </Link>

        {/* Hero */}
        <AnimatedSection>
          <div className="bg-aing-card border border-aing-border rounded-2xl p-8 mb-6">
            {/* Icon or thumbnail */}
            {project.thumbnail_url ? (
              <img
                src={project.thumbnail_url}
                alt={project.title}
                className="w-full h-48 object-cover rounded-xl mb-6"
              />
            ) : (
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center border mb-6 ${TYPE_COLORS[project.type]}`}>
                <TypeIcon size={24} />
              </div>
            )}

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <span className={`text-xs px-2 py-0.5 rounded-full border font-mono ${TYPE_COLORS[project.type]}`}>
                {project.type}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[project.status]}`}>
                {STATUS_LABELS[project.status]}
              </span>
              {project.semester && (
                <span className="text-xs px-2 py-0.5 rounded-full border border-aing-border text-aing-muted font-mono flex items-center gap-1">
                  <Clock size={10} />
                  {project.semester}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-aing-text mb-3">{project.title}</h1>

            {project.description && (
              <p className="text-aing-muted text-sm leading-relaxed mb-4">{project.description}</p>
            )}

            {/* Date range */}
            {(project.start_date || project.end_date) && (
              <p className="text-xs text-aing-muted mb-4">
                기간: {project.start_date ?? '?'} ~ {project.end_date ?? '진행중'}
              </p>
            )}

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {project.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            )}

            {/* Links */}
            <div className="flex gap-4">
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-aing-muted hover:text-aing-text transition-colors"
                >
                  <Github size={14} />
                  GitHub
                </a>
              )}
              {project.demo_url && (
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-aing-blue hover:text-aing-text transition-colors"
                >
                  <ExternalLink size={14} />
                  Demo
                </a>
              )}
            </div>
          </div>
        </AnimatedSection>

        {/* Outcome */}
        {project.outcome && (
          <AnimatedSection delay={100}>
            <div className="bg-aing-card border border-aing-border rounded-2xl p-6 mb-6">
              <h2 className="text-sm font-semibold text-aing-text mb-3 flex items-center gap-2">
                <Trophy size={14} className="text-yellow-500" />
                결과물 / 성과
              </h2>
              <p className="text-aing-muted text-sm leading-relaxed">{project.outcome}</p>
            </div>
          </AnimatedSection>
        )}

        {/* Members */}
        {members.length > 0 && (
          <AnimatedSection delay={200}>
            <div className="bg-aing-card border border-aing-border rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-aing-text mb-4 flex items-center gap-2">
                <Users size={14} className="text-aing-blue" />
                참여 멤버 ({members.length})
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {members.map(pm => (
                  <Link
                    key={pm.id}
                    to={`/members/${pm.member_id}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-aing-border hover:border-blue-200 transition-colors"
                  >
                    {pm.member?.avatar_url ? (
                      <img
                        src={pm.member.avatar_url}
                        alt={pm.member.name}
                        className="w-9 h-9 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 border border-aing-border flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-aing-text">
                          {pm.member?.name?.[0]?.toUpperCase() ?? '?'}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-aing-text truncate">
                        {pm.member?.name ?? '멤버'}
                      </div>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full border ${ROLE_COLORS[pm.role] ?? ROLE_COLORS['member']}`}>
                        {pm.role}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </AnimatedSection>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailPage;
