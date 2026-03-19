import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Crown, ChevronRight, PlusCircle, Pencil, Trash2, X, Check } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';
import { supabase, OpsTeamMember, Member } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const demoData: OpsTeamMember[] = [
  { id: '1', name: 'test', role: '회장', responsibilities: 'test', level: 'president', order: 1, generation: 1 },
  { id: '2', name: 'test', role: '부회장', responsibilities: 'test', level: 'vp', order: 2, generation: 1 },
  { id: '3', name: 'test', role: '기획팀장', responsibilities: 'test', level: 'lead', order: 3, generation: 1 },
];

const LEVEL_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  president: { label: '회장',   color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-200' },
  vp:        { label: '부회장', color: 'text-purple-500', bg: 'bg-purple-50 border-purple-200' },
  lead:      { label: '팀장',   color: 'text-aing-blue',  bg: 'bg-aing-blue-light border-blue-200' },
  member:    { label: '팀원',   color: 'text-aing-muted', bg: 'bg-white border-aing-border' },
};

const EMPTY_FORM = {
  name: '', role: '', responsibilities: '',
  level: 'member' as OpsTeamMember['level'],
  order: 0, generation: 1,
};

const AboutOpsPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [members, setMembers] = useState<OpsTeamMember[]>(demoData);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [selectedOps, setSelectedOps] = useState<OpsTeamMember | null>(null);
  const [opsLinkedMember, setOpsLinkedMember] = useState<Member | null>(null);
  const [loadingMember, setLoadingMember] = useState(false);

  const handleCardClick = async (m: OpsTeamMember) => {
    setSelectedOps(m);
    setOpsLinkedMember(null);
    setLoadingMember(true);
    try {
      const { data } = await supabase
        .from('members')
        .select('*')
        .ilike('name', m.name.trim())
        .single();
      if (data) setOpsLinkedMember(data as Member);
    } catch {}
    setLoadingMember(false);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase
          .from('ops_members')
          .select('*')
          .order('order', { ascending: true });
        if (data && data.length > 0) setMembers(data as OpsTeamMember[]);
      } catch { /* use demo */ }
    };
    load();
  }, []);

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (m: OpsTeamMember) => {
    setEditId(m.id);
    setForm({ name: m.name, role: m.role, responsibilities: m.responsibilities, level: m.level, order: m.order, generation: m.generation });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    if (!id.startsWith('test-') && !['1','2','3'].includes(id)) {
      await supabase.from('ops_members').delete().eq('id', id);
    }
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form };
    if (editId && !['1','2','3'].includes(editId)) {
      await supabase.from('ops_members').update(payload).eq('id', editId);
      setMembers(prev => prev.map(m => m.id === editId ? { ...m, ...payload } : m));
    } else if (editId) {
      setMembers(prev => prev.map(m => m.id === editId ? { ...m, ...payload } : m));
    } else {
      const { data } = await supabase.from('ops_members').insert(payload).select().single();
      if (data) setMembers(prev => [...prev, data as OpsTeamMember]);
      else setMembers(prev => [...prev, { ...payload, id: `local-${Date.now()}` } as OpsTeamMember]);
    }
    setShowModal(false);
    setSaving(false);
  };

  // Group by level
  const presidents = members.filter(m => m.level === 'president').sort((a,b) => a.order - b.order);
  const vps = members.filter(m => m.level === 'vp').sort((a,b) => a.order - b.order);
  const leads = members.filter(m => m.level === 'lead').sort((a,b) => a.order - b.order);
  const regularMembers = members.filter(m => m.level === 'member').sort((a,b) => a.order - b.order);

  const MemberCard: React.FC<{ m: OpsTeamMember; size?: 'lg' | 'md' | 'sm'; onClick?: () => void }> = ({ m, size = 'md', onClick }) => {
    const cfg = LEVEL_CONFIG[m.level] || LEVEL_CONFIG.member;
    return (
      <div onClick={onClick} className={`card group relative text-center cursor-pointer hover:border-aing-blue transition-colors ${size === 'lg' ? 'py-8' : size === 'sm' ? 'py-4' : 'py-6'}`}>
        {isAdmin && (
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => openEdit(m)} className="p-1 rounded border border-aing-border bg-white text-aing-muted hover:text-aing-blue transition-colors"><Pencil size={11} /></button>
            <button onClick={() => handleDelete(m.id)} className="p-1 rounded border border-aing-border bg-white text-aing-muted hover:text-red-500 transition-colors"><Trash2 size={11} /></button>
          </div>
        )}
        {/* Avatar circle */}
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 border-2 ${cfg.bg}`}>
          <span className={`text-xl font-bold ${cfg.color}`}>{m.name[0] || '?'}</span>
        </div>
        <div className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-mono mb-2 ${cfg.bg} ${cfg.color}`}>
          {m.level === 'president' && <Crown size={10} />}
          {m.role}
        </div>
        <h3 className={`font-semibold text-aing-text mb-1 ${size === 'lg' ? 'text-lg' : 'text-sm'}`}>{m.name}</h3>
        {m.responsibilities && (
          <p className="text-xs text-aing-muted leading-relaxed">{m.responsibilities}</p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      {/* Member Detail Modal */}
      {selectedOps && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedOps(null)}>
          <div className="bg-white rounded-2xl border border-aing-border shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-aing-text">{selectedOps.name}</h3>
              <button onClick={() => setSelectedOps(null)} className="text-aing-muted hover:text-aing-text"><X size={18}/></button>
            </div>
            {loadingMember ? (
              <div className="space-y-2">{[...Array(3)].map((_,i)=><div key={i} className="animate-pulse h-6 bg-aing-border rounded"/>)}</div>
            ) : opsLinkedMember ? (
              <div className="space-y-3">
                <p className="text-sm text-aing-muted">{selectedOps.role} · {selectedOps.level}</p>
                {selectedOps.responsibilities && <p className="text-sm text-aing-text border-l-2 border-aing-blue pl-3">{selectedOps.responsibilities}</p>}
                <hr className="border-aing-border"/>
                {opsLinkedMember.bio && <p className="text-sm text-aing-muted">{opsLinkedMember.bio}</p>}
                {opsLinkedMember.interests && opsLinkedMember.interests.length > 0 && (
                  <div className="flex flex-wrap gap-1">{opsLinkedMember.interests.map(i=><span key={i} className="tag">#{i}</span>)}</div>
                )}
                {opsLinkedMember.github && (
                  <a href={opsLinkedMember.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-aing-muted hover:text-aing-text">
                    GitHub →
                  </a>
                )}
                <div className="pt-2">
                  <Link to={`/members/${opsLinkedMember.id}`} className="btn-primary text-xs">프로필 전체 보기</Link>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-aing-muted">{selectedOps.role}</p>
                {selectedOps.responsibilities && <p className="text-sm text-aing-text border-l-2 border-aing-blue pl-3">{selectedOps.responsibilities}</p>}
                <p className="text-xs text-aing-muted mt-3">멤버 프로필이 연결되지 않았습니다.</p>
              </div>
            )}
          </div>
        </div>
      )}


      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl border border-aing-border shadow-xl w-full max-w-md">
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-aing-text">{editId ? '운영진 수정' : '운영진 추가'}</h3>
                <button type="button" onClick={() => setShowModal(false)}><X size={16} className="text-aing-muted" /></button>
              </div>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input-field" placeholder="이름 *" required />
              <input value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className="input-field" placeholder="직책 (예: 회장, 기획팀장)" required />
              <select value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value as OpsTeamMember['level'] }))} className="input-field">
                <option value="president">회장 (president)</option>
                <option value="vp">부회장 (vp)</option>
                <option value="lead">팀장 (lead)</option>
                <option value="member">팀원 (member)</option>
              </select>
              <input value={form.responsibilities} onChange={e => setForm(p => ({ ...p, responsibilities: e.target.value }))} className="input-field" placeholder="담당 업무 설명" />
              <div className="grid grid-cols-2 gap-3">
                <input value={form.generation} onChange={e => setForm(p => ({ ...p, generation: parseInt(e.target.value) || 1 }))} className="input-field" placeholder="기수 (숫자)" type="number" min="1" />
                <input value={form.order} onChange={e => setForm(p => ({ ...p, order: parseInt(e.target.value) || 99 }))} className="input-field" placeholder="정렬 순서" type="number" min="1" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={saving} className="btn-primary text-sm flex items-center gap-2">
                  <Check size={14} />{saving ? '저장 중...' : editId ? '수정' : '추가'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost text-sm">취소</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <section className="py-20 px-6 border-b border-aing-border">
        <div className="max-w-4xl mx-auto flex items-start justify-between flex-wrap gap-4">
          <AnimatedSection>
            {/* Sub-nav */}
            <div className="flex items-center gap-2 mb-6 text-xs text-aing-muted">
              <Link to="/about" className="hover:text-aing-text transition-colors">About</Link>
              <ChevronRight size={12} />
              <Link to="/about/ops" className="hover:text-aing-text transition-colors text-aing-text font-medium">Ops Team</Link>
              <ChevronRight size={12} />
              <Link to="/about/ex-ops" className="hover:text-aing-text transition-colors">Ex-Ops</Link>
            </div>
            <div className="inline-flex items-center gap-2 tag-blue mb-6">
              <Users size={12} />
              <span>Ops Team</span>
            </div>
            <h1 className="section-title text-5xl mb-4">
              <span className="text-gradient">운영진</span>
            </h1>
            <p className="section-subtitle max-w-xl">현재 YourClub을 이끌어 가는 운영진을 소개합니다.</p>
          </AnimatedSection>
          {isAdmin && (
            <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm mt-auto">
              <PlusCircle size={14} />운영진 추가
            </button>
          )}
        </div>
      </section>

      {/* Org Chart */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* President row */}
          {presidents.length > 0 && (
            <AnimatedSection>
              <div className="text-center mb-4">
                <span className="text-xs font-mono text-aing-muted uppercase tracking-widest">President</span>
              </div>
              <div className="flex justify-center">
                <div className="w-full max-w-xs">
                  {presidents.map(m => <MemberCard key={m.id} m={m} size="lg" onClick={() => handleCardClick(m)} />)}
                </div>
              </div>
              {/* Connector line */}
              {(vps.length > 0 || leads.length > 0) && (
                <div className="flex justify-center mt-4">
                  <div className="w-px h-8 bg-aing-border" />
                </div>
              )}
            </AnimatedSection>
          )}

          {/* VP row */}
          {vps.length > 0 && (
            <AnimatedSection delay={100}>
              <div className="text-center mb-4">
                <span className="text-xs font-mono text-aing-muted uppercase tracking-widest">Vice President</span>
              </div>
              <div className={`grid gap-4 ${vps.length === 1 ? 'max-w-xs mx-auto' : `grid-cols-${Math.min(vps.length, 3)} max-w-2xl mx-auto`}`}>
                {vps.map(m => <MemberCard key={m.id} m={m} size="md" onClick={() => handleCardClick(m)} />)}
              </div>
              {leads.length > 0 && (
                <div className="flex justify-center mt-4">
                  <div className="w-px h-8 bg-aing-border" />
                </div>
              )}
            </AnimatedSection>
          )}

          {/* Leads row */}
          {leads.length > 0 && (
            <AnimatedSection delay={200}>
              <div className="text-center mb-4">
                <span className="text-xs font-mono text-aing-muted uppercase tracking-widest">Team Leads</span>
              </div>
              <div className={`grid gap-4 ${leads.length <= 4 ? `grid-cols-${leads.length}` : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'} max-w-3xl mx-auto`}>
                {leads.map(m => <MemberCard key={m.id} m={m} size="sm" onClick={() => handleCardClick(m)} />)}
              </div>
              {regularMembers.length > 0 && (
                <div className="flex justify-center mt-4">
                  <div className="w-px h-8 bg-aing-border" />
                </div>
              )}
            </AnimatedSection>
          )}

          {/* Regular members row */}
          {regularMembers.length > 0 && (
            <AnimatedSection delay={300}>
              <div className="text-center mb-4">
                <span className="text-xs font-mono text-aing-muted uppercase tracking-widest">Members</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {regularMembers.map(m => <MemberCard key={m.id} m={m} size="sm" onClick={() => handleCardClick(m)} />)}
              </div>
            </AnimatedSection>
          )}

          {members.length === 0 && (
            <div className="card border-dashed text-center py-16">
              <Users size={32} className="text-aing-muted mx-auto mb-4 opacity-40" />
              <p className="text-aing-muted text-sm">등록된 운영진이 없습니다.</p>
            </div>
          )}

          {/* Link to ex-ops */}
          <AnimatedSection>
            <div className="text-center pt-8 border-t border-aing-border">
              <p className="text-aing-muted text-sm mb-4">이전 운영진 보기</p>
              <Link to="/about/ex-ops" className="btn-ghost inline-flex items-center gap-2 text-sm">
                <Users size={14} />
                역대 운영진
                <ChevronRight size={14} />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default AboutOpsPage;
