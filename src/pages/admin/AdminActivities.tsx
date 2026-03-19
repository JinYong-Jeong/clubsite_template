import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, PlusCircle, Trash2, Pencil, X, Check, ExternalLink } from 'lucide-react';
import { supabase, Activity } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

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
  result: '',
  detail_url: '',
  image_url: '',
  detail_content: '',
};

const TYPE_COLORS: Record<string, string> = {
  study: 'text-aing-blue border-blue-200 bg-aing-blue-light',
  project: 'text-purple-500 border-purple-200 bg-purple-50',
  competition: 'text-amber-500 border-amber-200 bg-amber-50',
  seminar: 'text-green-500 border-green-200 bg-green-50',
};

const STATUS_COLORS: Record<string, string> = {
  ongoing: 'text-green-500',
  completed: 'text-aing-muted',
  upcoming: 'text-yellow-500',
};

const AdminActivities: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin) { navigate('/admin/login'); return; }
    fetchActivities();
  }, [isAdmin, navigate]);

  const fetchActivities = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false });
    setActivities((data as Activity[]) || []);
    setLoading(false);
  };

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
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
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      semester: form.semester,
      title: form.title,
      type: form.type,
      description: form.description,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      github: form.github || null,
      status: form.status,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      participants: form.participants ? parseInt(form.participants) : null,
      result: form.result || null,
      detail_url: form.detail_url || null,
      image_url: form.image_url || null,
      detail_content: form.detail_content || null,
    };
    if (editId) {
      await supabase.from('activities').update(payload).eq('id', editId);
    } else {
      await supabase.from('activities').insert(payload);
    }
    setShowForm(false);
    setEditId(null);
    fetchActivities();
    setSaving(false);
  };

  const deleteActivity = async (id: string) => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    await supabase.from('activities').delete().eq('id', id);
    setActivities(prev => prev.filter(a => a.id !== id));
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin" className="flex items-center gap-2 text-aing-muted hover:text-aing-text text-sm transition-colors">
            <ArrowLeft size={14} />
            Dashboard
          </Link>
          <span className="text-aing-border">|</span>
          <Link
            to="/history"
            className="flex items-center gap-1.5 text-xs text-aing-blue hover:text-aing-text transition-colors"
          >
            <ExternalLink size={12} />
            히스토리 보기
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-aing-text">활동 관리</h1>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm">
            <PlusCircle size={14} />
            활동 추가
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="card mb-8 grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-aing-text">{editId ? '활동 수정' : '새 활동 추가'}</h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-aing-muted hover:text-aing-text">
                <X size={16} />
              </button>
            </div>
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
            <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} className="input-field" placeholder="태그 (쉼표 구분: CV, ResNet)" />
            <input value={form.github} onChange={e => setForm(p => ({ ...p, github: e.target.value }))} className="input-field" placeholder="GitHub URL" />
            {/* Extended fields */}
            <input value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} className="input-field" placeholder="시작일 (YYYY-MM-DD)" />
            <input value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} className="input-field" placeholder="종료일 (YYYY-MM-DD)" />
            <input value={form.participants} onChange={e => setForm(p => ({ ...p, participants: e.target.value }))} className="input-field" placeholder="팀 인원 수 (숫자)" type="number" min="1" />
            <input value={form.result} onChange={e => setForm(p => ({ ...p, result: e.target.value }))} className="input-field" placeholder="결과 (예: 1st place, 대상)" />
            <input value={form.detail_url} onChange={e => setForm(p => ({ ...p, detail_url: e.target.value }))} className="input-field" placeholder="대회/상세 페이지 URL" />
            <input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} className="input-field" placeholder="이미지 URL" />
          <label className="text-xs text-aing-muted mt-2 block">상세 내용 (Markdown)</label>
          <textarea value={form.detail_content || ''} onChange={e => setForm(p => ({ ...p, detail_content: e.target.value }))} className="input-field w-full resize-none font-mono text-xs" rows={6} placeholder="## 활동 소개&#10;&#10;자세한 내용을 작성하세요." />
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary text-sm flex items-center gap-2">
                <Check size={14} />
                {saving ? '저장 중...' : editId ? '수정' : '추가'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost text-sm">취소</button>
            </div>
          </form>
        )}

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="card animate-pulse h-16" />)}
          </div>
        ) : activities.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-aing-muted text-sm">등록된 활동이 없습니다. 추가해보세요.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map(a => (
              <div key={a.id} className="card flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-mono ${TYPE_COLORS[a.type] || ''}`}>
                      {a.type}
                    </span>
                    <span className={`text-xs font-mono ${STATUS_COLORS[a.status]}`}>● {a.status}</span>
                    <span className="text-xs text-aing-muted font-mono">{a.semester}</span>
                    {a.result && <span className="text-xs text-amber-500 font-mono">🏆 {a.result}</span>}
                  </div>
                  <span className="font-medium text-aing-text text-sm">{a.title}</span>
                  {a.description && (
                    <p className="text-xs text-aing-muted mt-0.5 truncate">{a.description}</p>
                  )}
                  {a.tags && a.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {a.tags.map(tag => (
                        <span key={tag} className="tag text-xs">{tag}</span>
                      ))}
                    </div>
                  )}
                  {(a.start_date || a.end_date) && (
                    <p className="text-xs text-aing-muted mt-0.5 font-mono">
                      {a.start_date || '?'} ~ {a.end_date || '?'}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg border border-aing-border text-aing-muted hover:text-aing-blue hover:border-blue-200 transition-colors" title="수정">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => deleteActivity(a.id)} className="p-1.5 rounded-lg border border-aing-border text-aing-muted hover:text-red-500 hover:border-red-200 transition-colors" title="삭제">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminActivities;
