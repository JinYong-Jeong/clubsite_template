import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Github, ExternalLink, BookOpen, Code2, Beaker, Trophy, LayoutList, Clock, ChevronDown } from 'lucide-react';
import { supabase, Project } from '../lib/supabase';
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

const demoProjects: Project[] = [
  {
    id: '1',
    title: 'ResNet Study',
    description: 'ResNet-50 논문 분석 및 PyTorch 직접 구현. He et al. (2015) 논문을 처음부터 끝까지 분석하고 직접 구현합니다.',
    type: 'study',
    status: 'ongoing',
    semester: '2026 Spring',
    tags: ['CV', 'ResNet', 'PyTorch'],
    github: 'https://github.com/aing-gachon/26-Spring-ResNet-Study',
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Transformer Study',
    description: 'Attention is All You Need 논문 구현. Transformer 아키텍처를 처음부터 구현하고 NLP 태스크에 적용합니다.',
    type: 'study',
    status: 'ongoing',
    semester: '2026 Spring',
    tags: ['NLP', 'Transformer', 'Attention'],
    github: 'https://github.com/aing-gachon/26-Spring-Transformer-Study',
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: '3',
    title: 'Senior Session 26 Spring',
    description: 'CV/NLP/RL 팀별 SOTA 모델 커스터마이징 프로젝트. 시니어 멤버들이 각자의 분야에서 최신 모델을 커스터마이징합니다.',
    type: 'project',
    status: 'ongoing',
    semester: '2026 Spring',
    tags: ['Senior', 'CV', 'NLP', 'RL'],
    github: 'https://github.com/aing-gachon/26-Spring-Senior-Session',
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
];

type ViewMode = 'grid' | 'timeline';

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  const TypeIcon = TYPE_ICONS[project.type] || Code2;
  const memberCount = project.project_members?.length ?? 0;

  return (
    <Link to={`/projects/${project.id}`} className="card group hover:border-blue-200 flex flex-col h-full block">
      {/* Thumbnail or icon */}
      <div className="mb-4">
        {project.thumbnail_url ? (
          <img
            src={project.thumbnail_url}
            alt={project.title}
            className="w-full h-32 object-cover rounded-xl"
          />
        ) : (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${TYPE_COLORS[project.type]}`}>
            <TypeIcon size={20} />
          </div>
        )}
      </div>

      {/* Header badges */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span className={`text-xs px-2 py-0.5 rounded-full border font-mono ${TYPE_COLORS[project.type]}`}>
          {project.type}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[project.status]}`}>
          {STATUS_LABELS[project.status]}
        </span>
      </div>

      {/* Title & description */}
      <h3 className="font-semibold text-aing-text text-sm mb-2 line-clamp-1">{project.title}</h3>
      {project.description && (
        <p className="text-aing-muted text-xs leading-relaxed mb-3 line-clamp-2 flex-1">
          {project.description}
        </p>
      )}

      {/* Semester & dates */}
      <div className="flex items-center gap-2 flex-wrap mb-3 text-xs text-aing-muted">
        {project.semester && (
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {project.semester}
          </span>
        )}
        {project.start_date && project.end_date && (
          <span>{project.start_date} ~ {project.end_date}</span>
        )}
      </div>

      {/* Tags */}
      {project.tags && project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {project.tags.slice(0, 4).map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
          {project.tags.length > 4 && (
            <span className="text-xs text-aing-muted">+{project.tags.length - 4}</span>
          )}
        </div>
      )}

      {/* Members avatars */}
      {memberCount > 0 && (
        <div className="flex items-center gap-1 mb-3">
          {project.project_members!.slice(0, 5).map(pm => (
            <div
              key={pm.id}
              className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 border border-aing-border flex items-center justify-center text-xs font-semibold text-aing-text -ml-1 first:ml-0"
            >
              {pm.member?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
          ))}
          {memberCount > 5 && (
            <span className="text-xs text-aing-muted ml-1">+{memberCount - 5}</span>
          )}
        </div>
      )}

      {/* Links */}
      <div className="flex gap-3 mt-auto pt-3 border-t border-aing-border">
        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs text-aing-muted hover:text-aing-text transition-colors"
            onClick={e => e.stopPropagation()}
          >
            <Github size={12} />
            GitHub
          </a>
        )}
        {project.demo_url && (
          <a
            href={project.demo_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs text-aing-muted hover:text-aing-blue transition-colors"
            onClick={e => e.stopPropagation()}
          >
            <ExternalLink size={12} />
            Demo
          </a>
        )}
      </div>
    </Link>
  );
};

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [semesterFilter, setSemesterFilter] = useState<string>('all');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*, project_members(*, member:members(id, name, avatar_url))')
          .order('created_at', { ascending: false });
        if (error || !data || data.length === 0) {
          setProjects(demoProjects);
        } else {
          setProjects(data as Project[]);
        }
      } catch {
        setProjects(demoProjects);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const semesters = Array.from(new Set(projects.map(p => p.semester).filter(Boolean))).sort().reverse();

  const filtered = projects.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (typeFilter !== 'all' && p.type !== typeFilter) return false;
    if (semesterFilter !== 'all' && p.semester !== semesterFilter) return false;
    return true;
  });

  // Stats
  const totalCount = projects.length;
  const ongoingCount = projects.filter(p => p.status === 'ongoing').length;
  const completedCount = projects.filter(p => p.status === 'completed').length;
  const memberSet = new Set(
    projects.flatMap(p => p.project_members?.map(pm => pm.member_id) ?? [])
  );

  // Timeline grouping
  const grouped = filtered.reduce<Record<string, Project[]>>((acc, p) => {
    const key = p.semester || '미분류';
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  const groupedEntries = Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a));

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      {/* Header */}
      <section className="py-20 px-6 border-b border-aing-border">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 tag-blue mb-6">
              <Code2 size={12} />
              <span>Projects</span>
            </div>
            <h1 className="section-title text-5xl mb-4">
              <span className="text-gradient">Project History</span>
            </h1>
            <p className="section-subtitle">A.ing에서 진행한 모든 스터디, 프로젝트, 연구를 기록합니다.</p>
          </AnimatedSection>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 px-6 border-b border-aing-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: '전체 프로젝트', value: totalCount, color: 'text-aing-blue' },
              { label: '진행중', value: ongoingCount, color: 'text-blue-500' },
              { label: '완료', value: completedCount, color: 'text-green-500' },
              { label: '참여 멤버', value: memberSet.size, color: 'text-purple-500' },
            ].map((stat, i) => (
              <AnimatedSection key={stat.label} delay={i * 80}>
                <div className="card text-center">
                  <div className={`text-3xl font-bold mb-1 ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-aing-muted">{stat.label}</div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Filters & View toggle */}
      <section className="py-6 px-6 border-b border-aing-border sticky top-16 z-30 glass">
        <div className="max-w-6xl mx-auto space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Status filter */}
              <div className="flex items-center gap-2 flex-wrap">
                {(['all', 'planned', 'ongoing', 'completed', 'archived'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                      statusFilter === s
                        ? 'bg-aing-dark text-white'
                        : 'border border-aing-border text-aing-muted hover:border-aing-blue hover:text-aing-blue'
                    }`}
                  >
                    {s === 'all' ? '전체' : STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* View mode toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-aing-dark text-white' : 'text-aing-muted hover:text-aing-text'}`}
                title="그리드 보기"
              >
                <LayoutList size={14} />
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'timeline' ? 'bg-aing-dark text-white' : 'text-aing-muted hover:text-aing-text'}`}
                title="타임라인 보기"
              >
                <Clock size={14} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Type filter */}
            {(['all', 'study', 'project', 'research', 'competition'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  typeFilter === t
                    ? 'bg-aing-blue text-white'
                    : 'border border-aing-border text-aing-muted hover:border-aing-blue hover:text-aing-blue'
                }`}
              >
                {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}

            {/* Semester dropdown */}
            {semesters.length > 0 && (
              <div className="relative">
                <select
                  value={semesterFilter}
                  onChange={e => setSemesterFilter(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-1 rounded-full text-xs font-medium border border-aing-border text-aing-muted bg-transparent hover:border-aing-blue focus:outline-none focus:border-aing-blue cursor-pointer"
                >
                  <option value="all">모든 학기</option>
                  {semesters.map(s => (
                    <option key={s} value={s!}>{s}</option>
                  ))}
                </select>
                <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-aing-muted" />
              </div>
            )}

            <span className="text-xs text-aing-muted ml-auto">{filtered.length}개</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="w-12 h-12 rounded-xl bg-aing-border mb-4" />
                  <div className="h-4 bg-aing-border rounded w-3/4 mb-2" />
                  <div className="h-3 bg-aing-border rounded w-full mb-1" />
                  <div className="h-3 bg-aing-border rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((project, i) => (
                <AnimatedSection key={project.id} delay={i * 60}>
                  <ProjectCard project={project} />
                </AnimatedSection>
              ))}
            </div>
          ) : (
            // Timeline view
            <div className="space-y-16">
              {groupedEntries.map(([semester, items]) => (
                <AnimatedSection key={semester}>
                  <div>
                    <div className="flex items-center gap-4 mb-8">
                      <h2 className="text-xl font-semibold text-aing-text whitespace-nowrap">{semester}</h2>
                      <div className="flex-1 gradient-line" />
                      <span className="text-sm text-aing-muted whitespace-nowrap">{items.length}개</span>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {items.map((project, i) => (
                        <AnimatedSection key={project.id} delay={i * 60}>
                          <ProjectCard project={project} />
                        </AnimatedSection>
                      ))}
                    </div>
                  </div>
                </AnimatedSection>
              ))}
              {groupedEntries.length === 0 && (
                <div className="text-center py-24">
                  <p className="text-aing-muted text-sm">프로젝트가 없습니다.</p>
                </div>
              )}
            </div>
          )}

          {filtered.length === 0 && !loading && (
            <div className="text-center py-24">
              <p className="text-aing-muted text-sm">조건에 맞는 프로젝트가 없습니다.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProjectsPage;
