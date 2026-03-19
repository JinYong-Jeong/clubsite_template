import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, PlusCircle, Trash2, UserCheck, UserX, Pencil, Search, X, Check } from 'lucide-react';
import { supabase, Member } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const TRACK_COLORS: Record<string, string> = {
  junior: 'text-aing-blue border-blue-200 bg-aing-blue-light',
  senior: 'text-purple-500 border-purple-200 bg-purple-50',
  admin: 'text-green-500 border-green-200 bg-green-50',
  ob: 'text-gray-500 border-gray-200 bg-gray-50',
};

type FormState = {
  name: string; role: string; track: Member['track']; semester: string;
  github: string; bio: string; avatar_url: string; password_hash: string;
  status: 'busy'|'mid'|'free'; is_active: boolean;
};
const defaultForm: FormState = {
  name:'', role:'', track:'junior', semester:'2026 Spring',
  github:'', bio:'', avatar_url:'', password_hash:'', status:'free', is_active:true,
};

const AdminMembers: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [trackFilter, setTrackFilter] = useState<'all'|'junior'|'senior'|'admin'|'ob'>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string|null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin) { navigate('/admin/login'); return; }
    fetchMembers();
  }, [isAdmin, navigate]);

  const fetchMembers = async () => {
    setLoading(true);
    const { data } = await supabase.from('members').select('*').order('created_at', { ascending: true });
    setMembers(data || []);
    setLoading(false);
  };

  const filtered = members.filter(m => {
    if (trackFilter !== 'all' && m.track !== trackFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!m.name.toLowerCase().includes(q) && !(m.role||'').toLowerCase().includes(q) && !(m.semester||'').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('members').update({ is_active: !current }).eq('id', id);
    setMembers(prev => prev.map(m => m.id === id ? { ...m, is_active: !current } : m));
  };
  const deleteMember = async (id: string) => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    await supabase.from('members').delete().eq('id', id);
    setMembers(prev => prev.filter(m => m.id !== id));
  };
  const openAddForm = () => { setEditingId(null); setForm(defaultForm); setShowAdd(true); };
  const openEditForm = (member: Member) => {
    setEditingId(member.id);
    setForm({ name:member.name||'', role:member.role||'', track:member.track||'junior', semester:member.semester||'2026 Spring', github:member.github||'', bio:member.bio||'', avatar_url:member.avatar_url||'', password_hash:'', status:(member.status as 'busy'|'mid'|'free')||'free', is_active:member.is_active??true });
    setShowAdd(true);
  };
  const cancelForm = () => { setShowAdd(false); setEditingId(null); setForm(defaultForm); };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const payload: Record<string,unknown> = { name:form.name, role:form.role, track:form.track, semester:form.semester, github:form.github, bio:form.bio, avatar_url:form.avatar_url, status:form.status, is_active:form.is_active };
    if (form.password_hash.trim()) payload.password_hash = form.password_hash.trim();
    if (editingId) {
      await supabase.from('members').update(payload).eq('id', editingId);
    } else {
      await supabase.from('members').insert({ ...payload, is_active:true, created_at:new Date().toISOString() });
    }
    cancelForm(); fetchMembers(); setSaving(false);
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Link to="/admin" className="flex items-center gap-2 text-aing-muted hover:text-aing-text text-sm mb-8 transition-colors">
          <ArrowLeft size={14} />Dashboard
        </Link>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-aing-text">부원 관리
            <span className="text-sm font-normal text-aing-muted ml-2">({members.length}명)</span>
          </h1>
          {!showAdd && (
            <button onClick={openAddForm} className="btn-primary flex items-center gap-2 text-sm">
              <PlusCircle size={14} />부원 추가
            </button>
          )}
        </div>

        {/* Add/Edit Form Modal */}
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl border border-aing-border shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-aing-text">{editingId?'부원 수정':'새 부원 추가'}</h3>
                  <button type="button" onClick={cancelForm}><X size={18}/></button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><label className="text-xs text-aing-muted mb-1 block">이름 *</label><input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} className="input-field" placeholder="이름" required /></div>
                  <div><label className="text-xs text-aing-muted mb-1 block">역할</label><input value={form.role} onChange={e=>setForm(p=>({...p,role:e.target.value}))} className="input-field" placeholder="예: Researcher" /></div>
                  <div><label className="text-xs text-aing-muted mb-1 block">트랙</label>
                    <select value={form.track} onChange={e=>setForm(p=>({...p,track:e.target.value as Member['track']}))} className="input-field">
                      <option value="junior">Junior</option><option value="senior">Senior</option><option value="admin">Admin</option><option value="ob">OB</option>
                    </select>
                  </div>
                  <div><label className="text-xs text-aing-muted mb-1 block">기수</label><input value={form.semester} onChange={e=>setForm(p=>({...p,semester:e.target.value}))} className="input-field" placeholder="2026 Spring" /></div>
                  <div><label className="text-xs text-aing-muted mb-1 block">GitHub URL</label><input value={form.github} onChange={e=>setForm(p=>({...p,github:e.target.value}))} className="input-field" placeholder="https://github.com/..." /></div>
                  <div><label className="text-xs text-aing-muted mb-1 block">한 줄 소개</label><input value={form.bio} onChange={e=>setForm(p=>({...p,bio:e.target.value}))} className="input-field" placeholder="소개" /></div>
                  <div className="sm:col-span-2"><label className="text-xs text-aing-muted mb-1 block">아바타 URL</label><input value={form.avatar_url} onChange={e=>setForm(p=>({...p,avatar_url:e.target.value}))} className="input-field" placeholder="https://..." /></div>
                  <div><label className="text-xs text-aing-muted mb-1 block">비밀번호{editingId?' (변경시만)':''}</label><input type="password" value={form.password_hash} onChange={e=>setForm(p=>({...p,password_hash:e.target.value}))} className="input-field" placeholder="비밀번호" /></div>
                  <div><label className="text-xs text-aing-muted mb-1 block">상태</label>
                    <select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value as 'busy'|'mid'|'free'}))} className="input-field">
                      <option value="free">여유</option><option value="mid">보통</option><option value="busy">바쁨</option>
                    </select>
                  </div>
                  {editingId && <div className="sm:col-span-2 flex items-center gap-2"><input type="checkbox" id="is_active" checked={form.is_active} onChange={e=>setForm(p=>({...p,is_active:e.target.checked}))} /><label htmlFor="is_active" className="text-sm">활성 멤버</label></div>}
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="btn-primary text-sm flex items-center gap-2"><Check size={13}/>{saving?'저장 중...':(editingId?'저장':'추가')}</button>
                  <button type="button" onClick={cancelForm} className="btn-ghost text-sm">취소</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Filter & Search */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {(['all','junior','senior','admin','ob'] as const).map(t => (
            <button key={t} onClick={()=>setTrackFilter(t)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${trackFilter===t?'bg-aing-dark text-white':'border-aing-border text-aing-muted hover:border-aing-blue hover:text-aing-blue'}`}>
              {t==='all'?'전체':t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
          <div className="relative ml-auto">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-aing-muted"/>
            <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="이름, 역할, 기수 검색..." className="input-field pl-8 py-1.5 text-xs w-48"/>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_,i)=><div key={i} className="card animate-pulse h-14"/>)}</div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-aing-border bg-aing-bg">
                  <th className="text-left px-4 py-3 text-xs text-aing-muted font-mono">이름</th>
                  <th className="text-left px-4 py-3 text-xs text-aing-muted font-mono hidden sm:table-cell">역할</th>
                  <th className="text-left px-4 py-3 text-xs text-aing-muted font-mono">트랙</th>
                  <th className="text-left px-4 py-3 text-xs text-aing-muted font-mono hidden md:table-cell">기수</th>
                  <th className="text-left px-4 py-3 text-xs text-aing-muted font-mono hidden md:table-cell">상태</th>
                  <th className="text-right px-4 py-3 text-xs text-aing-muted font-mono">액션</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(member => (
                  <tr key={member.id} className={`border-b border-aing-border last:border-0 hover:bg-aing-bg transition-colors ${!member.is_active?'opacity-40':''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 border border-aing-border flex items-center justify-center shrink-0 text-xs font-semibold text-aing-text">
                          {member.avatar_url ? <img src={member.avatar_url} alt={member.name} className="w-8 h-8 rounded-lg object-cover"/> : member.name.slice(0,2)}
                        </div>
                        <span className="font-medium text-aing-text">{member.name}</span>
                        {!member.is_active && <span className="text-xs text-aing-muted">(비활성)</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-aing-muted hidden sm:table-cell">{member.role||'-'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-mono ${TRACK_COLORS[member.track]||''}`}>{member.track}</span>
                    </td>
                    <td className="px-4 py-3 text-aing-muted text-xs hidden md:table-cell">{member.semester||'-'}</td>
                    <td className="px-4 py-3 text-aing-muted text-xs hidden md:table-cell">{member.status||'-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={()=>openEditForm(member)} className="p-1.5 rounded-lg border border-aing-border text-aing-muted hover:text-aing-blue hover:border-blue-200 transition-colors" title="수정"><Pencil size={13}/></button>
                        <button onClick={()=>toggleActive(member.id, member.is_active)} className={`p-1.5 rounded-lg border transition-colors ${member.is_active?'border-green-200 text-green-500 hover:bg-green-50':'border-aing-border text-aing-muted'}`} title={member.is_active?'비활성화':'활성화'}>
                          {member.is_active?<UserCheck size={13}/>:<UserX size={13}/>}
                        </button>
                        <button onClick={()=>deleteMember(member.id)} className="p-1.5 rounded-lg border border-aing-border text-aing-muted hover:text-red-500 hover:border-red-200 transition-colors"><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-aing-muted text-sm">검색 결과가 없습니다.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMembers;
