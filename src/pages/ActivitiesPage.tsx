import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, BookOpen, Code2, Users, Trophy, ArrowRight, Github, Pencil, PlusCircle, Trash2, X, Check, ExternalLink, Search } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';
import { supabase, Activity } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

type FilterType = 'all' | 'study' | 'project' | 'competition' | 'seminar';

const hardcodedFallback: Activity[] = [
  {
    id: '1',
    type: 'study',
    title: 'ResNet Study',
    description: 'ResNet-50 논문 분석 및 PyTorch 구현',
    tags: ['CV', 'ResNet', 'PyTorch'],
    github: 'https://github.com/aing-gachon/26-Spring-ResNet-Study',
    status: 'ongoing',
    semester: '2026 Spring',
  },
  {
    id: '2',
    type: 'study',
    title: 'Transformer Study',
    description: 'Attention is All You Need 구현',
    tags: ['NLP', 'Transformer', 'Attention'],
    github: 'https://github.com/aing-gachon/26-Spring-Transformer-Study',
    status: 'ongoing',
    semester: '2026 Spring',
  },
  {
    id: '3',
    type: 'project',
    title: 'Senior Session',
    description: 'CV/NLP/RL 팀별 SOTA 모델 커스터마이징',
    tags: ['Senior', 'Project', 'Research'],
    github: 'https://github.com/aing-gachon/26-Spring-Senior-Session',
    status: 'ongoing',
    semester: '2026 Spring',
  },
];

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  study:       { icon: BookOpen, color: 'text-aing-blue',   bg: 'border-blue-200 bg-aing-blue-light',  label: 'Study' },
  project:     { icon: Code2,    color: 'text-purple-500',  bg: 'border-purple-200 bg-purple-50',       label: 'Project' },
  competition: { icon: Trophy,   color: 'text-amber-500',   bg: 'border-amber-200 bg-amber-50',         label: 'Competition' },
  seminar:     { icon: Users,    color: 'text-green-500',   bg: 'border-green-200 bg-green-50',         label: 'Seminar' },
};

const STATUS_COLORS: Record<string, string> = {
  ongoing:   'text-green-500',
  completed: 'text-aing-muted',
  upcoming:  'text-yellow-500',
};

const STATUS_LABELS: Record<string, string> = {
  ongoing: '진행 중', completed: '완료', upcoming: '예정',
};

const EMPTY_FORM = {
  semester: '2026 Spring',
  title: '',
  type: 'study' as Activity['type'],
  description: '',
  tags: '',
  github: '',
  status: 'ongoing' as Activity['status'],
  start_date: '',
  end_date: '',
  participants: '',
  participants_type: 'min' as 'single'|'min'|'max'|'range',
  participants_min: '',
  participants_max: '',
  result: '',
  detail_url: '',
  image_url: '',
  detail_content: '',
};

function formatDateRange(start?: string, end?: string) {
  if (!start && !end) return null;
  const fmt = (d: string) => new Date(d).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  if (start && end) return `${fmt(start)} ~ ${fmt(end)}`;
  if (start) return `${fmt(start)} ~`;
  return `~ ${fmt(end!)}`;
}

const ActivityCard: React.FC<{
  item: Activity;
  onEdit?: (a: Activity) => void;
  onDelete?: (id: string) => void;
  isAdmin: boolean;
}> = ({ item, onEdit, onDelete, isAdmin }) => {
  const navigate = useNavigate();
  const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.study;
  const Icon = cfg.icon;
  const dateRange = formatDateRange(item.start_date, item.end_date);

  return (
    <div className="card group h-full flex flex-col relative cursor-pointer hover:border-aing-blue transition-colors" onClick={() => { const slug = (item as any).slug || item.id; navigate(`/activities/${slug}`); }}>
      {/* Admin controls */}
      {isAdmin && (
        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit?.(item); }}
            className="p-1 rounded-lg border border-aing-border bg-white text-aing-muted hover:text-aing-blue hover:border-blue-200 transition-colors"
            title="수정"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete?.(item.id); }}
            className="p-1 rounded-lg border border-aing-border bg-white text-aing-muted hover:text-red-500 hover:border-red-200 transition-colors"
            title="삭제"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-mono ${cfg.color} ${cfg.bg}`}>
            <Icon size={10} />
            {cfg.label}
          </span>
        </div>
        <span className={`text-xs font-mono flex items-center gap-1 ${STATUS_COLORS[item.status] || 'text-aing-muted'}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {STATUS_LABELS[item.status] || item.status}
        </span>
      </div>

      <h3 className="text-base font-semibold text-aing-text mb-2">{item.title}</h3>
      <p className="text-aing-muted text-sm mb-3 leading-relaxed flex-1">{item.description}</p>

      {/* Competition-specific: date range */}
      {dateRange && (
        <div className="flex items-center gap-1 text-xs text-aing-muted mb-2">
          <Calendar size={10} />
          <span className="font-mono">{dateRange}</span>
        </div>
      )}

      {/* Competition-specific: participants (team size) */}
      {item.participants && item.type === 'competition' && (
        <div className="flex items-center gap-1 text-xs text-aing-muted mb-2">
          <Users size={10} />
          <span>팀 구성: {item.participants}인팀</span>
        </div>
      )}

      {/* Result badge (e.g. "1st place", "대상") */}
      {item.result && (
        <div className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 font-medium mb-3 w-fit">
          <Trophy size={10} />
          {item.result}
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(item.tags || []).map(tag => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>

      {/* Links */}
      <div className="flex flex-wrap items-center gap-3 mt-auto">
        {item.detail_url && (
          <a
            href={!item.detail_url || item.detail_url.startsWith('http') ? item.detail_url : 'https://' + item.detail_url}
            target="_blank"
            rel="noreferrer"
            onClick={e => e.stopPropagation()}
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
              item.type === 'competition'
                ? 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600'
                : 'btn-ghost'
            }`}
          >
            {item.type === 'competition' ? '대회 보기' : '자세히 보기'}
            <ExternalLink size={10} />
          </a>
        )}
        {item.github && (
          <a
            href={item.github}
            target="_blank"
            rel="noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1.5 text-xs text-aing-muted hover:text-aing-text transition-colors"
          >
            <Github size={12} />
            GitHub
            <ArrowRight size={10} />
          </a>
        )}
      </div>
    </div>
  );
};

// Edit/Add Modal
const ActivityModal: React.FC<{
  editId: string | null;
  form: typeof EMPTY_FORM;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  saving: boolean;
}> = ({ editId, form, setForm, onSubmit, onClose, saving }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
    <div className="bg-white rounded-2xl border border-aing-border shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <form onSubmit={onSubmit} className="p-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-semibold text-aing-text">{editId ? '활동 수정' : '새 활동 추가'}</h3>
          <button type="button" onClick={onClose} className="text-aing-muted hover:text-aing-text"><X size={18} /></button>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <input value={form.semester} onChange={e => setForm(p => ({ ...p, semester: e.target.value }))} className="input-field" placeholder="기수 (예: 2026 Spring)" required />
          <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="input-field" placeholder="제목 *" required />
          <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as Activity['type'] }))} className="input-field">
            <option value="study">Study</option>
            <option value="project">Project</option>
            <option value="competition">Competition</option>
            <option value="seminar">Seminar</option>
          </select>
          <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as Activity['status'] }))} className="input-field">
            <option value="ongoing">Ongoing</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
          </select>
          <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="input-field sm:col-span-2" placeholder="설명" />
          <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} className="input-field" placeholder="태그 (쉼표 구분)" />
          <input value={form.github} onChange={e => setForm(p => ({ ...p, github: e.target.value }))} className="input-field" placeholder="GitHub URL" />
          <input value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} className="input-field" placeholder="시작일 (YYYY-MM-DD)" />
          <input value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} className="input-field" placeholder="종료일 (YYYY-MM-DD)" />
          <div className="sm:col-span-2 space-y-2">
            <label className="text-xs text-aing-muted">팀 구성 방식</label>
            <div className="flex gap-2 flex-wrap">
              {(['single','min','max','range'] as const).map(t => (
                <button key={t} type="button"
                  onClick={() => setForm(p=>({...p, participants_type: t as any}))}
                  className={(form as any).participants_type===t ? "px-3 py-1 rounded-full text-xs border transition-all bg-aing-dark text-white" : "px-3 py-1 rounded-full text-xs border transition-all border-aing-border text-aing-muted"}>
                  {t==='single'?'단일':t==='min'?'이상':t==='max'?'이하':'범위'}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {(form as any).participants_type==='single' && <input value={form.participants} onChange={e=>setForm(p=>({...p,participants:e.target.value}))} className="input-field w-32" placeholder="인원 수" type="number" min="1" />}
              {(form as any).participants_type==='min' && <input value={(form as any).participants_min||''} onChange={e=>setForm(p=>({...p,participants_min:e.target.value} as any))} className="input-field w-32" placeholder="최소 인원" type="number" min="1" />}
              {(form as any).participants_type==='max' && <input value={(form as any).participants_max||''} onChange={e=>setForm(p=>({...p,participants_max:e.target.value} as any))} className="input-field w-32" placeholder="최대 인원" type="number" min="1" />}
              {(form as any).participants_type==='range' && <>
                <input value={(form as any).participants_min||''} onChange={e=>setForm(p=>({...p,participants_min:e.target.value} as any))} className="input-field w-28" placeholder="최소" type="number" min="1" />
                <span className="self-center text-aing-muted">~</span>
                <input value={(form as any).participants_max||''} onChange={e=>setForm(p=>({...p,participants_max:e.target.value} as any))} className="input-field w-28" placeholder="최대" type="number" min="1" />
              </>}
            </div>
          </div>
          <input value={form.result} onChange={e => setForm(p => ({ ...p, result: e.target.value }))} className="input-field" placeholder="결과 (예: 1st place, 대상)" />
          <input value={form.detail_url} onChange={e => setForm(p => ({ ...p, detail_url: e.target.value }))} className="input-field" placeholder="상세 페이지 URL (detail_url)" />
          <input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} className="input-field" placeholder="이미지 URL (image_url)" />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="btn-primary text-sm flex items-center gap-2">
            <Check size={14} />
            {saving ? '저장 중...' : editId ? '수정' : '추가'}
          </button>
          <button type="button" onClick={onClose} className="btn-ghost text-sm">취소</button>
        </div>
      </form>
    </div>
  </div>
);

const ActivitiesPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [allActivities, setAllActivities] = useState<Activity[]>(hardcodedFallback);
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const { data } = await supabase
          .from('activities')
          .select('*')
          .order('created_at', { ascending: false });
        if (data && data.length > 0) {
          setAllActivities(data as Activity[]);
        }
      } catch { /* use fallback */ }
    };
    loadActivities();
  }, []);

  const filtered = (filter === 'all' ? allActivities : allActivities.filter(a => a.type === filter))
    .filter(a => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        (a.description || '').toLowerCase().includes(q) ||
        (a.tags || []).some(t => t.toLowerCase().includes(q))
      );
    });

  // Group by semester for display
  const grouped: Record<string, Activity[]> = {};
  filtered.forEach(a => {
    if (!grouped[a.semester]) grouped[a.semester] = [];
    grouped[a.semester].push(a);
  });
  const semesters = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (a: Activity) => {
    setEditId(a.id);
    setForm({
      semester: a.semester,
      title: a.title,
      type: a.type,
      description: a.description || '',
      tags: (a.tags || []).join(', '),
      github: a.github || '',
      status: a.status,
      start_date: a.start_date || '',
      end_date: a.end_date || '',
      participants: a.participants ? String(a.participants) : '',
      result: a.result || '',
      detail_url: a.detail_url || '',
      image_url: a.image_url || '',
      detail_content: a.detail_content || '',
      participants_type: (a.participants_type as any) || 'single',
      participants_min: a.participants_min ? String(a.participants_min) : '',
      participants_max: a.participants_max ? String(a.participants_max) : '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    // If it's a hardcoded test entry, just remove locally
    if (id.startsWith('test-')) {
      setAllActivities(prev => prev.filter(a => a.id !== id));
      return;
    }
    await supabase.from('activities').delete().eq('id', id);
    setAllActivities(prev => prev.filter(a => a.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload: Partial<Activity> = {
      semester: form.semester,
      title: form.title,
      type: form.type,
      description: form.description,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      github: form.github || undefined,
      status: form.status,
      start_date: form.start_date || undefined,
      end_date: form.end_date || undefined,
      participants: form.participants ? parseInt(form.participants) : undefined,
      result: form.result || undefined,
      detail_url: form.detail_url || undefined,
      image_url: form.image_url || undefined,
      detail_content: form.detail_content || undefined,
    };
    if (editId && !editId.startsWith('test-')) {
      await supabase.from('activities').update(payload).eq('id', editId);
      setAllActivities(prev => prev.map(a => a.id === editId ? { ...a, ...payload } : a));
    } else if (editId && editId.startsWith('test-')) {
      // Update local only for test entries
      setAllActivities(prev => prev.map(a => a.id === editId ? { ...a, ...payload } : a));
    } else {
      const dbPayload = {
        ...payload,
        github: payload.github ?? null,
        start_date: payload.start_date ?? null,
        end_date: payload.end_date ?? null,
        participants: payload.participants ?? null,
        result: payload.result ?? null,
        detail_url: payload.detail_url ?? null,
        image_url: payload.image_url ?? null,
      };
      const { data } = await supabase.from('activities').insert(dbPayload).select().single();
      if (data) {
        setAllActivities(prev => [data as Activity, ...prev]);
      } else {
        // Local only fallback
        setAllActivities(prev => [{ ...payload, id: `local-${Date.now()}` } as Activity, ...prev]);
      }
    }
    setShowModal(false);
    setEditId(null);
    setSaving(false);
  };

  const FILTER_OPTIONS: { value: FilterType; label: string; icon: React.ElementType }[] = [
    { value: 'all', label: 'All', icon: Calendar },
    { value: 'study', label: 'Study', icon: BookOpen },
    { value: 'project', label: 'Project', icon: Code2 },
    { value: 'competition', label: 'Competition', icon: Trophy },
    { value: 'seminar', label: 'Seminar', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      {showModal && (
        <ActivityModal
          editId={editId}
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          onClose={() => { setShowModal(false); setEditId(null); }}
          saving={saving}
        />
      )}

      {/* Header */}
      <section className="py-20 px-6 border-b border-aing-border">
        <div className="max-w-4xl mx-auto flex items-start justify-between flex-wrap gap-4">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 tag-blue mb-6">
              <BookOpen size={12} />
              <span>Activities</span>
            </div>
            <h1 className="section-title text-5xl mb-4">
              <span className="text-gradient">What We Do</span>
            </h1>
            <p className="section-subtitle max-w-xl">
              매 학기 진행되는 스터디, 프로젝트, 대회, 세미나 활동을 기록합니다.
            </p>
          </AnimatedSection>
          {isAdmin && (
            <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm mt-auto">
              <PlusCircle size={14} />
              활동 추가
            </button>
          )}
        </div>
      </section>

      {/* Overview Cards */}
      <section className="py-16 px-6 border-b border-aing-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: BookOpen, label: 'Weekly Study', desc: '논문 리딩 & 코드 구현', color: 'text-aing-blue' },
              { icon: Code2,    label: 'Projects',     desc: 'SOTA 모델 커스터마이징', color: 'text-purple-500' },
              { icon: Trophy,   label: 'Competition',  desc: '해커톤 & 경진대회 참가', color: 'text-amber-500' },
              { icon: Users,    label: 'Seminars',     desc: '지식 공유 & 발표',       color: 'text-green-500' },
            ].map((item, i) => (
              <AnimatedSection key={item.label} delay={i * 100}>
                <div className="card text-center group">
                  <item.icon size={24} className={`${item.color} mx-auto mb-3`} />
                  <h3 className="text-sm font-semibold text-aing-text mb-1">{item.label}</h3>
                  <p className="text-xs text-aing-muted">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Filter Bar */}
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

      {/* Activities by Semester */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          {semesters.length === 0 ? (
            <div className="card border-dashed text-center py-16">
              <Calendar size={32} className="text-aing-muted mx-auto mb-4 opacity-40" />
              <p className="text-aing-muted text-sm">해당 유형의 활동이 없습니다.</p>
            </div>
          ) : (
            semesters.map(semester => (
              <div key={semester} className="mb-20">
                <AnimatedSection>
                  <div className="flex items-center gap-4 mb-10">
                    <h2 className="text-2xl font-semibold text-aing-text">{semester}</h2>
                    <div className="flex-1 gradient-line" />
                    <span className="text-xs text-aing-muted font-mono">{grouped[semester].length}개</span>
                  </div>
                </AnimatedSection>

                <div className="grid md:grid-cols-3 gap-6">
                  {grouped[semester].map((item, i) => (
                    <AnimatedSection key={item.id || item.title} delay={i * 150}>
                      <ActivityCard
                        item={item}
                        isAdmin={isAdmin}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                      />
                    </AnimatedSection>
                  ))}
                </div>
              </div>
            ))
          )}

          {/* Empty future slot */}
          <AnimatedSection>
            <div className="card border-dashed text-center py-16">
              <Calendar size={32} className="text-aing-muted mx-auto mb-4 opacity-40" />
              <p className="text-aing-muted text-sm">다음 활동이 추가될 예정입니다.</p>
            </div>
          </AnimatedSection>

          {/* Link to history */}
          <AnimatedSection>
            <div className="mt-12 text-center">
              <p className="text-aing-muted text-sm mb-4">전체 활동 히스토리를 타임라인으로 보려면?</p>
              <Link
                to="/history"
                className="btn-primary inline-flex items-center gap-2 text-sm"
              >
                <Calendar size={14} />
                활동 히스토리 전체 보기
                <ArrowRight size={14} />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default ActivitiesPage;
