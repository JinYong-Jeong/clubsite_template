import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, BookOpen, Code2, Users, Trophy, Github, ExternalLink, Pencil, X, Check, Plus, Trash2 } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';
import { supabase, Activity, ActivityAward, Member } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  study:       { icon: BookOpen, color: 'text-aing-blue',  bg: 'border-blue-200 bg-aing-blue-light',  label: 'Study' },
  project:     { icon: Code2,   color: 'text-purple-500', bg: 'border-purple-200 bg-purple-50',       label: 'Project' },
  competition: { icon: Trophy,  color: 'text-amber-500',  bg: 'border-amber-200 bg-amber-50',         label: 'Competition' },
  seminar:     { icon: Users,   color: 'text-green-500',  bg: 'border-green-200 bg-green-50',         label: 'Seminar' },
};
const STATUS_COLORS: Record<string, string> = { ongoing: 'text-green-500', completed: 'text-aing-muted', upcoming: 'text-yellow-500' };
const STATUS_LABELS: Record<string, string> = { ongoing: '진행 중', completed: '완료', upcoming: '예정' };
const RANK_LABELS: Record<string, string> = { '1st': '🥇 1st Place', '2nd': '🥈 2nd Place', '3rd': '🥉 3rd Place', 'special': '🏅 특별상', 'participation': '🎖️ 참가상' };

function formatDate(d?: string) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

function participantsText(a: Activity): string | null {
  const t = a.participants_type || 'single';
  if (t === 'single' && a.participants) return `${a.participants}인`;
  if (t === 'min' && a.participants_min) return `${a.participants_min}인 이상`;
  if (t === 'max' && a.participants_max) return `${a.participants_max}인 이하`;
  if (t === 'range' && a.participants_min && a.participants_max) return `${a.participants_min}~${a.participants_max}인`;
  if (a.participants) return `${a.participants}인`;
  return null;
}

const EMPTY_FORM = {
  semester: '', title: '', type: 'study' as Activity['type'],
  description: '', tags: '', github: '', status: 'ongoing' as Activity['status'],
  start_date: '', end_date: '', participants: '',
  participants_type: 'min' as 'single'|'min'|'max'|'range',
  participants_min: '', participants_max: '',
  result: '', detail_url: '', image_url: '',
  detail_content: '', instagram_url: '', slug: '',
};

const ActivityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [awards, setAwards] = useState<(ActivityAward & { member?: Member })[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [awardForm, setAwardForm] = useState({ member_id: '', rank: '1st' as ActivityAward['rank'], note: '' });

  useEffect(() => {
    const load = async () => {
      if (!id) { setLoading(false); return; }
      try {
        const { data } = await supabase.from('activities').select('*').eq('id', id).single();
        if (data) setActivity(data as Activity);
      } catch {}
      try {
        const { data } = await supabase
          .from('activity_awards')
          .select('*, member:members(*)')
          .eq('activity_id', id);
        if (data) setAwards(data as any);
      } catch {}
      try {
        const { data } = await supabase.from('members').select('id,name').eq('is_active', true).order('name');
        if (data) setAllMembers(data as Member[]);
      } catch {}
      setLoading(false);
    };
    load();
  }, [id]);

  const openEdit = () => {
    if (!activity) return;
    setForm({
      semester: activity.semester,
      title: activity.title,
      type: activity.type,
      description: activity.description || '',
      tags: (activity.tags || []).join(', '),
      github: activity.github || '',
      status: activity.status,
      start_date: activity.start_date || '',
      end_date: activity.end_date || '',
      participants: activity.participants ? String(activity.participants) : '',
      participants_type: (activity.participants_type as any) || 'single',
      participants_min: activity.participants_min ? String(activity.participants_min) : '',
      participants_max: activity.participants_max ? String(activity.participants_max) : '',
      result: activity.result || '',
      detail_url: activity.detail_url || '',
      image_url: activity.image_url || '',
      detail_content: activity.detail_content || '',
      instagram_url: (activity as any).instagram_url as string || '',
      slug: (activity as any).slug as string || '',
    });
    setShowEditModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity) return;
    setSaving(true);
    const payload: Partial<Activity> = {
      semester: form.semester, title: form.title, type: form.type,
      description: form.description,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      github: form.github || null as any,
      status: form.status,
      start_date: form.start_date || null as any,
      end_date: form.end_date || null as any,
      participants: form.participants ? parseInt(form.participants) : null as any,
      participants_type: form.participants_type,
      participants_min: form.participants_min ? parseInt(form.participants_min) : null as any,
      participants_max: form.participants_max ? parseInt(form.participants_max) : null as any,
      result: form.result || null as any,
      detail_url: form.detail_url || null as any,
      image_url: form.image_url || null as any,
      detail_content: form.detail_content || null as any,
      instagram_url: (form as any).instagram_url || null,
      slug: (form as any).slug || null,
    };
    await supabase.from('activities').update(payload).eq('id', activity.id);
    setActivity(prev => prev ? { ...prev, ...payload } : prev);
    setShowEditModal(false);
    setSaving(false);
  };

  const handleAddAward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity || !awardForm.member_id) return;
    setSaving(true);
    const { data } = await supabase
      .from('activity_awards')
      .insert({ activity_id: activity.id, member_id: awardForm.member_id, rank: awardForm.rank, note: awardForm.note || null })
      .select('*, member:members(*)')
      .single();
    if (data) setAwards(prev => [...prev, data as any]);
    setAwardForm({ member_id: '', rank: '1st', note: '' });
    setShowAwardModal(false);
    setSaving(false);
  };

  const handleDeleteAward = async (awardId: string) => {
    await supabase.from('activity_awards').delete().eq('id', awardId);
    setAwards(prev => prev.filter(a => a.id !== awardId));
  };

  if (loading) return (
    <div className="min-h-screen bg-aing-bg pt-20 flex items-center justify-center">
      <div className="space-y-4 w-full max-w-2xl px-6">
        {[...Array(4)].map((_, i) => <div key={i} className="card animate-pulse h-16" />)}
      </div>
    </div>
  );

  if (!activity) return (
    <div className="min-h-screen bg-aing-bg pt-20 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl font-bold text-gradient mb-4">404</div>
        <p className="text-aing-muted mb-6">활동을 찾을 수 없습니다.</p>
        <Link to="/activities" className="btn-primary text-sm">활동 목록으로</Link>
      </div>
    </div>
  );

  const cfg = TYPE_CONFIG[activity.type] || TYPE_CONFIG.study;
  const Icon = cfg.icon;
  const ptxt = participantsText(activity);

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl border border-aing-border shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-aing-text">활동 수정</h3>
                <button type="button" onClick={() => setShowEditModal(false)}><X size={18} /></button>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <input value={form.semester} onChange={e => setForm(p=>({...p,semester:e.target.value}))} className="input-field" placeholder="기수" required />
                <input value={form.title} onChange={e => setForm(p=>({...p,title:e.target.value}))} className="input-field" placeholder="제목 *" required />
                <select value={form.type} onChange={e => setForm(p=>({...p,type:e.target.value as any}))} className="input-field">
                  <option value="study">Study</option><option value="project">Project</option>
                  <option value="competition">Competition</option><option value="seminar">Seminar</option>
                </select>
                <select value={form.status} onChange={e => setForm(p=>({...p,status:e.target.value as any}))} className="input-field">
                  <option value="ongoing">Ongoing</option><option value="upcoming">Upcoming</option><option value="completed">Completed</option>
                </select>
                <input value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))} className="input-field sm:col-span-2" placeholder="설명" />
                <input value={form.tags} onChange={e => setForm(p=>({...p,tags:e.target.value}))} className="input-field" placeholder="태그 (쉼표 구분)" />
                <input value={form.github} onChange={e => setForm(p=>({...p,github:e.target.value}))} className="input-field" placeholder="GitHub URL" />
                <input value={form.start_date} onChange={e => setForm(p=>({...p,start_date:e.target.value}))} className="input-field" placeholder="시작일 (YYYY-MM-DD)" />
                <input value={form.end_date} onChange={e => setForm(p=>({...p,end_date:e.target.value}))} className="input-field" placeholder="종료일 (YYYY-MM-DD)" />
                <div className="sm:col-span-2">
                  <label className="text-xs text-aing-muted mb-1 block">팀 구성 방식</label>
                  <div className="flex gap-2 flex-wrap">
                    {(['single','min','max','range'] as const).map(t => (
                      <button key={t} type="button"
                        onClick={() => setForm(p=>({...p,participants_type:t}))}
                        className={`px-3 py-1 rounded-full text-xs border transition-all ${form.participants_type===t?'bg-aing-dark text-white':'border-aing-border text-aing-muted'}`}>
                        {t==='single'?'단일':t==='min'?'이상':t==='max'?'이하':'범위'}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    {(form.participants_type==='single') && <input value={form.participants} onChange={e=>setForm(p=>({...p,participants:e.target.value}))} className="input-field w-32" placeholder="인원 수" type="number" min="1" />}
                    {(form.participants_type==='min') && <input value={form.participants_min} onChange={e=>setForm(p=>({...p,participants_min:e.target.value}))} className="input-field w-32" placeholder="최소 인원" type="number" min="1" />}
                    {(form.participants_type==='max') && <input value={form.participants_max} onChange={e=>setForm(p=>({...p,participants_max:e.target.value}))} className="input-field w-32" placeholder="최대 인원" type="number" min="1" />}
                    {(form.participants_type==='range') && <>
                      <input value={form.participants_min} onChange={e=>setForm(p=>({...p,participants_min:e.target.value}))} className="input-field w-28" placeholder="최소" type="number" min="1" />
                      <span className="self-center text-aing-muted">~</span>
                      <input value={form.participants_max} onChange={e=>setForm(p=>({...p,participants_max:e.target.value}))} className="input-field w-28" placeholder="최대" type="number" min="1" />
                    </>}
                  </div>
                </div>
                <input value={form.result} onChange={e => setForm(p=>({...p,result:e.target.value}))} className="input-field" placeholder="결과 (예: 대상, 1st place)" />
                <input value={(form as any).slug || ''} onChange={e=>setForm(p=>({...p,slug:e.target.value} as any))} className="input-field" placeholder="숫자 슬러그 (예: 29)" />
                <input value={(form as any).instagram_url || ''} onChange={e=>setForm(p=>({...p,instagram_url:e.target.value} as any))} className="input-field" placeholder="Instagram URL" />
                <input value={form.detail_url} onChange={e => setForm(p=>({...p,detail_url:e.target.value}))} className="input-field" placeholder="상세 URL (예: https://...)" />
                <input value={form.image_url} onChange={e => setForm(p=>({...p,image_url:e.target.value}))} className="input-field sm:col-span-2" placeholder="이미지 URL" />
                <div className="sm:col-span-2">
                  <label className="text-xs text-aing-muted block mb-1">상세 내용 (Markdown 지원)</label>
                  <textarea value={form.detail_content} onChange={e=>setForm(p=>({...p,detail_content:e.target.value}))} className="input-field w-full resize-none font-mono text-xs" rows={8} placeholder="## 활동 소개&#10;&#10;자세한 내용을 마크다운으로 작성하세요.&#10;&#10;- 항목 1&#10;- 항목 2&#10;&#10;**강조** *기울임*" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary text-sm flex items-center gap-2"><Check size={14}/>{saving?'저장 중...':'저장'}</button>
                <button type="button" onClick={() => setShowEditModal(false)} className="btn-ghost text-sm">취소</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Award Modal */}
      {showAwardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl border border-aing-border shadow-xl w-full max-w-md p-6">
            <form onSubmit={handleAddAward} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-aing-text">수상 멤버 태그</h3>
                <button type="button" onClick={() => setShowAwardModal(false)}><X size={18}/></button>
              </div>
              <select value={awardForm.member_id} onChange={e=>setAwardForm(p=>({...p,member_id:e.target.value}))} className="input-field w-full" required>
                <option value="">멤버 선택</option>
                {allMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <select value={awardForm.rank} onChange={e=>setAwardForm(p=>({...p,rank:e.target.value as any}))} className="input-field w-full">
                <option value="1st">🥇 1st Place</option>
                <option value="2nd">🥈 2nd Place</option>
                <option value="3rd">🥉 3rd Place</option>
                <option value="special">🏅 특별상</option>
                <option value="participation">🎖️ 참가상</option>
              </select>
              <input value={awardForm.note} onChange={e=>setAwardForm(p=>({...p,note:e.target.value}))} className="input-field w-full" placeholder="비고 (선택)" />
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary text-sm flex items-center gap-2"><Check size={14}/>태그 추가</button>
                <button type="button" onClick={() => setShowAwardModal(false)} className="btn-ghost text-sm">취소</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Back */}
      <div className="px-6 pt-8 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-aing-muted hover:text-aing-text transition-colors">
            <ArrowLeft size={14} />활동 목록으로
          </button>
          {isAdmin && (
            <button onClick={openEdit} className="btn-ghost text-sm flex items-center gap-2"><Pencil size={13}/>수정</button>
          )}
        </div>
      </div>

      {/* Header */}
      <section className="px-6 pb-10 border-b border-aing-border">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection>
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border font-mono ${cfg.color} ${cfg.bg}`}>
                <Icon size={11}/>{cfg.label}
              </span>
              <span className={`text-xs font-mono flex items-center gap-1 ${STATUS_COLORS[activity.status] || 'text-aing-muted'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current"/>
                {STATUS_LABELS[activity.status] || activity.status}
              </span>
              <span className="text-xs text-aing-muted font-mono">{activity.semester}</span>
            </div>
            <h1 className="text-3xl font-bold text-aing-text mb-4">{activity.title}</h1>
            {activity.description && <p className="text-aing-muted leading-relaxed text-base">{activity.description}</p>}
          </AnimatedSection>
        </div>
      </section>

      {/* Body */}
      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {activity.image_url && (
            <AnimatedSection>
              <div className="card p-0 overflow-hidden">
                <img src={activity.image_url} alt={activity.title} className="w-full max-h-80 object-cover"/>
              </div>
            </AnimatedSection>
          )}

          <AnimatedSection>
            <div className="card space-y-4">
              {(activity.start_date || activity.end_date) && (
                <div className="flex items-start gap-3">
                  <Calendar size={15} className="text-aing-muted mt-0.5 shrink-0"/>
                  <div>
                    <p className="text-xs text-aing-muted mb-1 font-mono">기간</p>
                    <p className="text-sm text-aing-text">
                      {formatDate(activity.start_date)}{activity.start_date && activity.end_date && ' ~ '}{formatDate(activity.end_date)}
                    </p>
                  </div>
                </div>
              )}
              {ptxt && (
                <div className="flex items-start gap-3">
                  <Users size={15} className="text-aing-muted mt-0.5 shrink-0"/>
                  <div>
                    <p className="text-xs text-aing-muted mb-1 font-mono">팀 구성</p>
                    <p className="text-sm text-aing-text">{ptxt}</p>
                  </div>
                </div>
              )}
              {activity.result && (
                <div className="flex items-start gap-3">
                  <Trophy size={15} className="text-amber-500 mt-0.5 shrink-0"/>
                  <div>
                    <p className="text-xs text-aing-muted mb-1 font-mono">결과</p>
                    <div className="inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 font-medium">
                      <Trophy size={12}/>{activity.result}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </AnimatedSection>

          {/* Awards */}
          {(awards.length > 0 || isAdmin) && activity.type === 'competition' && (
            <AnimatedSection>
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-aing-text flex items-center gap-2"><Trophy size={14} className="text-amber-500"/>수상 멤버</h2>
                  {isAdmin && (
                    <button onClick={() => setShowAwardModal(true)} className="btn-ghost text-xs flex items-center gap-1.5"><Plus size={12}/>태그 추가</button>
                  )}
                </div>
                {awards.length === 0 ? (
                  <p className="text-xs text-aing-muted">아직 태그된 수상자가 없습니다.</p>
                ) : (
                  <div className="space-y-2">
                    {awards.map(aw => (
                      <div key={aw.id} className="flex items-center justify-between p-3 rounded-xl border border-aing-border bg-white">
                        <div className="flex items-center gap-3">
                          <span className="text-base">{aw.rank === '1st' ? '🥇' : aw.rank === '2nd' ? '🥈' : aw.rank === '3rd' ? '🥉' : aw.rank === 'special' ? '🏅' : '🎖️'}</span>
                          <div>
                            <Link to={`/members/${aw.member_id}`} className="text-sm font-medium text-aing-text hover:text-aing-blue transition-colors">
                              {aw.member?.name || '알 수 없음'}
                            </Link>
                            <p className="text-xs text-aing-muted">{RANK_LABELS[aw.rank]}{aw.note && ` · ${aw.note}`}</p>
                          </div>
                        </div>
                        {isAdmin && (
                          <button onClick={() => handleDeleteAward(aw.id)} className="text-aing-muted hover:text-red-500 transition-colors"><Trash2 size={13}/></button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </AnimatedSection>
          )}

          {/* Detail Content (Markdown) */}
          {activity.detail_content && (
            <AnimatedSection>
              <div className="card">
                <p className="text-xs text-aing-muted font-mono mb-3">상세 내용</p>
                <div className="text-aing-text text-sm leading-relaxed space-y-1">
                  {activity.detail_content.split('\n').map((line, i) => {
                    if (line.startsWith('## ')) return <h2 key={i} className="font-bold text-lg mt-4 mb-2">{line.slice(3)}</h2>;
                    if (line.startsWith('### ')) return <h3 key={i} className="font-semibold text-base mt-3 mb-1">{line.slice(4)}</h3>;
                    if (line.startsWith('- ')) return <li key={i} className="ml-5 list-disc text-aing-muted">{line.slice(2)}</li>;
                    if (line === '') return <br key={i} />;
                    return <p key={i}>{line}</p>;
                  })}
                </div>
              </div>
            </AnimatedSection>
          )}

          {activity.tags && activity.tags.length > 0 && (
            <AnimatedSection>
              <div className="card">
                <p className="text-xs text-aing-muted font-mono mb-3">태그</p>
                <div className="flex flex-wrap gap-2">
                  {activity.tags.map(tag => <span key={tag} className="tag">#{tag}</span>)}
                </div>
              </div>
            </AnimatedSection>
          )}

          {(activity.github || activity.detail_url) && (
            <AnimatedSection>
              <div className="card flex flex-wrap gap-3">
                {activity.detail_url && (
                  <a href={!activity.detail_url || activity.detail_url.startsWith('http') ? activity.detail_url : 'https://' + activity.detail_url} target="_blank" rel="noreferrer"
                    className={`inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border transition-colors ${activity.type==='competition'?'bg-amber-500 text-white border-amber-500 hover:bg-amber-600':'btn-primary'}`}>
                    {activity.type==='competition'?'대회 보기':'자세히 보기'}<ExternalLink size={13}/>
                  </a>
                )}
                {(activity as any).instagram_url && (
                  <a href={!(activity as any).instagram_url || (activity as any).instagram_url.startsWith('http') ? (activity as any).instagram_url : 'https://' + (activity as any).instagram_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm btn-ghost">
                    📷 Instagram
                  </a>
                )}
                {activity.github && (
                  <a href={activity.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm btn-ghost">
                    <Github size={14}/>GitHub 보기
                  </a>
                )}
              </div>
            </AnimatedSection>
          )}
        </div>
      </section>
    </div>
  );
};

export default ActivityDetailPage;
