import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, ChevronRight, PlusCircle, Pencil, Trash2, X, Check } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';
import { supabase, ExOpsMember, Member } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const demoData: ExOpsMember[] = [
  { id: '1', name: 'test', role: 'test', generation: 'test', term: 'test', description: 'test' },
];

const EMPTY_FORM = {
  name: '', role: '', generation: '', term: '', description: '',
};

const ExOpsPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [members, setMembers] = useState<ExOpsMember[]>(demoData);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [selectedExOps, setSelectedExOps] = useState<ExOpsMember | null>(null);
  const [exLinkedMember, setExLinkedMember] = useState<Member | null>(null);
  const [loadingMember, setLoadingMember] = useState(false);

  const handleCardClick = async (m: ExOpsMember) => {
    setSelectedExOps(m);
    setExLinkedMember(null);
    setLoadingMember(true);
    try {
      const { data } = await supabase
        .from('members')
        .select('*')
        .ilike('name', m.name.trim())
        .single();
      if (data) setExLinkedMember(data as Member);
    } catch {}
    setLoadingMember(false);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase
          .from('ex_ops_members')
          .select('*')
          .order('created_at', { ascending: false });
        if (data && data.length > 0) setMembers(data as ExOpsMember[]);
      } catch { /* use demo */ }
    };
    load();
  }, []);

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (m: ExOpsMember) => {
    setEditId(m.id);
    setForm({ name: m.name, role: m.role, generation: m.generation, term: m.term, description: m.description });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    if (!['1'].includes(id)) {
      await supabase.from('ex_ops_members').delete().eq('id', id);
    }
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form };
    if (editId && !['1'].includes(editId)) {
      await supabase.from('ex_ops_members').update(payload).eq('id', editId);
      setMembers(prev => prev.map(m => m.id === editId ? { ...m, ...payload } : m));
    } else if (editId) {
      setMembers(prev => prev.map(m => m.id === editId ? { ...m, ...payload } : m));
    } else {
      const { data } = await supabase.from('ex_ops_members').insert(payload).select().single();
      if (data) setMembers(prev => [data as ExOpsMember, ...prev]);
      else setMembers(prev => [{ ...payload, id: `local-${Date.now()}` } as ExOpsMember, ...prev]);
    }
    setShowModal(false);
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      {/* Member Detail Modal */}
      {selectedExOps && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedExOps(null)}>
          <div className="bg-white rounded-2xl border border-aing-border shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-aing-text">{selectedExOps.name}</h3>
              <button onClick={() => setSelectedExOps(null)} className="text-aing-muted hover:text-aing-text"><X size={18}/></button>
            </div>
            {loadingMember ? (
              <div className="space-y-2">{[...Array(3)].map((_,i)=><div key={i} className="animate-pulse h-6 bg-aing-border rounded"/>)}</div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-aing-muted">{selectedExOps.role} · {selectedExOps.generation} · {selectedExOps.term}</p>
                {selectedExOps.description && <p className="text-sm text-aing-text border-l-2 border-aing-blue pl-3">{selectedExOps.description}</p>}
                {exLinkedMember ? (
                  <>
                    <hr className="border-aing-border"/>
                    {exLinkedMember.bio && <p className="text-sm text-aing-muted">{exLinkedMember.bio}</p>}
                    {exLinkedMember.interests && exLinkedMember.interests.length > 0 && (
                      <div className="flex flex-wrap gap-1">{exLinkedMember.interests.map(i=><span key={i} className="tag">#{i}</span>)}</div>
                    )}
                    <div className="pt-2">
                      <Link to={`/members/${exLinkedMember.id}`} className="btn-primary text-xs">프로필 전체 보기</Link>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-aing-muted">현재 활동 멤버가 아닙니다.</p>
                )}
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
                <h3 className="text-sm font-semibold text-aing-text">{editId ? '역대 운영진 수정' : '역대 운영진 추가'}</h3>
                <button type="button" onClick={() => setShowModal(false)}><X size={16} className="text-aing-muted" /></button>
              </div>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input-field" placeholder="이름 *" required />
              <input value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className="input-field" placeholder="직책 (예: 회장, 기획팀장)" required />
              <input value={form.generation} onChange={e => setForm(p => ({ ...p, generation: e.target.value }))} className="input-field" placeholder="기수 (예: 1기, 2기)" required />
              <input value={form.term} onChange={e => setForm(p => ({ ...p, term: e.target.value }))} className="input-field" placeholder="활동 기간 (예: 2024 Spring ~ 2024 Fall)" required />
              <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="input-field" placeholder="주요 활동 / 업적 설명" />
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
              <Link to="/about/ops" className="hover:text-aing-text transition-colors">Ops Team</Link>
              <ChevronRight size={12} />
              <Link to="/about/ex-ops" className="hover:text-aing-text transition-colors text-aing-text font-medium">Ex-Ops</Link>
            </div>
            <div className="inline-flex items-center gap-2 tag-blue mb-6">
              <Users size={12} />
              <span>Ex-Ops</span>
            </div>
            <h1 className="section-title text-5xl mb-4">
              <span className="text-gradient">역대 운영진</span>
            </h1>
            <p className="section-subtitle max-w-xl">
              YourClub을 이끌어 온 역대 운영진 명단입니다.
            </p>
          </AnimatedSection>
          {isAdmin && (
            <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm mt-auto">
              <PlusCircle size={14} />추가
            </button>
          )}
        </div>
      </section>

      {/* List */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto space-y-3">
          {members.length === 0 ? (
            <div className="card border-dashed text-center py-16">
              <Users size={32} className="text-aing-muted mx-auto mb-4 opacity-40" />
              <p className="text-aing-muted text-sm">역대 운영진 기록이 없습니다.</p>
            </div>
          ) : (
            members.map((m, i) => (
              <AnimatedSection key={m.id} delay={i * 60}>
                <div onClick={() => handleCardClick(m)} className="card group flex items-center gap-4 hover:border-aing-blue transition-colors relative cursor-pointer">
                  {/* Avatar circle */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-aing-blue/20 to-purple-400/20 border border-aing-border flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-aing-text">{m.name[0] || '?'}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-aing-text">{m.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full border border-blue-200 bg-aing-blue-light text-aing-blue font-mono">{m.role}</span>
                      <span className="text-xs text-aing-muted font-mono">{m.generation}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="text-xs text-aing-muted">{m.term}</span>
                      {m.description && m.description !== 'test' && (
                        <span className="text-xs text-aing-muted truncate">— {m.description}</span>
                      )}
                      {m.description === 'test' && (
                        <span className="text-xs text-aing-muted italic">(test entry)</span>
                      )}
                    </div>
                  </div>

                  {/* Admin controls */}
                  {isAdmin && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg border border-aing-border text-aing-muted hover:text-aing-blue hover:border-blue-200 transition-colors"><Pencil size={12} /></button>
                      <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg border border-aing-border text-aing-muted hover:text-red-500 hover:border-red-200 transition-colors"><Trash2 size={12} /></button>
                    </div>
                  )}
                </div>
              </AnimatedSection>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default ExOpsPage;
