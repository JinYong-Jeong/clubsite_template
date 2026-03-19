import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, BookOpen, Code2, Users, Trophy, Search } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';
import { supabase, Activity } from '../lib/supabase';

type FilterType = 'all' | 'study' | 'project' | 'competition' | 'seminar';

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  study:       { icon: BookOpen, color: 'text-aing-blue',  bg: 'border-blue-200 bg-aing-blue-light', label: 'Study' },
  project:     { icon: Code2,   color: 'text-purple-500', bg: 'border-purple-200 bg-purple-50',      label: 'Project' },
  competition: { icon: Trophy,  color: 'text-amber-500',  bg: 'border-amber-200 bg-amber-50',        label: 'Competition' },
  seminar:     { icon: Users,   color: 'text-green-500',  bg: 'border-green-200 bg-green-50',        label: 'Seminar' },
};
const STATUS_COLORS: Record<string, string> = {
  ongoing: 'text-green-500', completed: 'text-aing-muted', upcoming: 'text-yellow-500',
};
const STATUS_LABELS: Record<string, string> = {
  ongoing: '진행 중', completed: '완료', upcoming: '예정',
};

const hardcodedFallback: Activity[] = [
  { id: '1', type: 'study', title: 'ResNet Study', description: 'ResNet-50 논문 분석 및 PyTorch 구현', tags: ['CV', 'ResNet', 'PyTorch'], github: 'https://github.com/aing-gachon/26-Spring-ResNet-Study', status: 'ongoing', semester: '2026 Spring' },
  { id: '2', type: 'study', title: 'Transformer Study', description: 'Attention is All You Need 구현', tags: ['NLP', 'Transformer'], github: 'https://github.com/aing-gachon/26-Spring-Transformer-Study', status: 'ongoing', semester: '2026 Spring' },
  { id: '3', type: 'project', title: 'Senior Session', description: 'CV/NLP/RL 팀별 SOTA 모델 커스터마이징', tags: ['Senior', 'Project'], github: 'https://github.com/aing-gachon/26-Spring-Senior-Session', status: 'ongoing', semester: '2026 Spring' },
];

function formatDateRange(start?: string, end?: string) {
  if (!start && !end) return null;
  const fmt = (d: string) => new Date(d).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  if (start && end) return `${fmt(start)} ~ ${fmt(end)}`;
  if (start) return `${fmt(start)} ~`;
  return `~ ${fmt(end!)}`;
}

const FILTER_OPTIONS: { value: FilterType; label: string; icon: React.ElementType }[] = [
  { value: 'all',         label: 'All',         icon: Calendar },
  { value: 'study',       label: 'Study',       icon: BookOpen },
  { value: 'project',     label: 'Project',     icon: Code2 },
  { value: 'competition', label: 'Competition', icon: Trophy },
  { value: 'seminar',     label: 'Seminar',     icon: Users },
];

const HistoryPage: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>(hardcodedFallback);
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase
          .from('activities')
          .select('*')
          .order('created_at', { ascending: false });
        if (data && data.length > 0) setActivities(data as Activity[]);
      } catch { /* use fallback */ }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = (filter === 'all' ? activities : activities.filter(a => a.type === filter))
    .filter(a => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        (a.description || '').toLowerCase().includes(q) ||
        (a.tags || []).some(t => t.toLowerCase().includes(q))
      );
    });

  const grouped: Record<string, Activity[]> = {};
  filtered.forEach(a => {
    if (!grouped[a.semester]) grouped[a.semester] = [];
    grouped[a.semester].push(a);
  });
  const semesters = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      {/* Header */}
      <section className="py-20 px-6 border-b border-aing-border">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 tag-blue mb-6">
              <Calendar size={12} />
              <span>History</span>
            </div>
            <h1 className="section-title text-5xl mb-4">
              <span className="text-gradient">활동 히스토리</span>
            </h1>
            <p className="section-subtitle max-w-xl">
              A.ing의 모든 학기 활동을 한눈에 확인하세요.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Filter + Search Bar */}
      <section className="py-4 px-6 border-b border-aing-border sticky top-16 z-30 glass">
        <div className="max-w-6xl mx-auto flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto">
            {FILTER_OPTIONS.map(opt => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    filter === opt.value
                      ? 'bg-aing-dark text-white'
                      : 'border border-aing-border text-aing-muted hover:border-aing-blue hover:text-aing-blue'
                  }`}
                >
                  <Icon size={12} />
                  {opt.label}
                </button>
              );
            })}
          </div>
          <div className="relative ml-auto">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-aing-muted" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="검색..."
              className="input-field pl-8 py-1.5 text-xs w-44"
            />
          </div>
        </div>
      </section>

      {/* Cards by Semester */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <div key={i} className="card animate-pulse h-48" />)}
            </div>
          ) : semesters.length === 0 ? (
            <div className="card border-dashed text-center py-20">
              <Calendar size={32} className="text-aing-muted mx-auto mb-4 opacity-40" />
              <p className="text-aing-muted text-sm">활동 기록이 없습니다.</p>
            </div>
          ) : (
            semesters.map((semester, si) => (
              <AnimatedSection key={semester} delay={si * 80}>
                <div className="mb-16">
                  <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-xl font-semibold text-aing-text">{semester}</h2>
                    <div className="flex-1 gradient-line" />
                    <span className="text-xs text-aing-muted font-mono">{grouped[semester].length}개</span>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    {grouped[semester].map((item, i) => {
                      const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.study;
                      const Icon = cfg.icon;
                      const dateRange = formatDateRange(item.start_date, item.end_date);
                      return (
                        <AnimatedSection key={item.id} delay={i * 80}>
                          <Link to={`/activities/${item.id}`} className="block h-full">
                            <div className="card h-full flex flex-col cursor-pointer hover:border-aing-blue transition-colors">
                              <div className="flex items-start justify-between mb-3">
                                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-mono ${cfg.color} ${cfg.bg}`}>
                                  <Icon size={10} />
                                  {cfg.label}
                                </span>
                                <span className={`text-xs font-mono flex items-center gap-1 ${STATUS_COLORS[item.status] || 'text-aing-muted'}`}>
                                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                  {STATUS_LABELS[item.status] || item.status}
                                </span>
                              </div>
                              <h3 className="text-sm font-semibold text-aing-text mb-2">{item.title}</h3>
                              {item.description && (
                                <p className="text-xs text-aing-muted mb-3 leading-relaxed flex-1 line-clamp-3">{item.description}</p>
                              )}
                              {dateRange && (
                                <div className="flex items-center gap-1 text-xs text-aing-muted mb-2">
                                  <Calendar size={10} />
                                  <span className="font-mono">{dateRange}</span>
                                </div>
                              )}
                              {item.result && (
                                <div className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 font-medium mb-2 w-fit">
                                  <Trophy size={10} />
                                  {item.result}
                                </div>
                              )}
                              {item.tags && item.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-auto pt-2">
                                  {item.tags.slice(0, 4).map(tag => (
                                    <span key={tag} className="tag text-xs">#{tag}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </Link>
                        </AnimatedSection>
                      );
                    })}
                  </div>
                </div>
              </AnimatedSection>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default HistoryPage;
