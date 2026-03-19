import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, ChevronLeft, Github, ExternalLink, ChevronRight, X, Check } from 'lucide-react';
import { supabase, Project, Member } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import AnimatedSection from '../../components/AnimatedSection';

const STATUS_LABELS: Record<string, string> = {
  planned: '진행예정',
  ongoing: '진행중',
  completed: '완료',
  archived: '아카이브',
};

const STATUS_NEXT: Record<string, string> = {
  planned: 'ongoing',
  ongoing: 'completed',
  completed: 'archived',
};

const STATUS_COLORS: Record<string, string> = {
  planned: 'bg-gray-100 text-gray-600 border-gray-200',
  ongoing: 'bg-blue-100 text-blue-700 border-blue-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  archived: 'bg-gray-100 text-gray-500 border-gray-200',
};

const TYPE_COLORS: Record<string, string> = {
  study: 'text-aing-blue border-blue-200 bg-aing-blue-light',
  project: 'text-purple-500 border-purple-200 bg-purple-50',
  research: 'text-green-500 border-green-200 bg-green-50',
  competition: 'text-orange-500 border-orange-200 bg-orange-50',
};

const emptyForm: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'project_members'> = {
  title: '',
  description: '',
  type: 'study',
  status: 'planned',
  semester: '',
  start_date: '',
  end_date: '',
  tags: [],
  github: '',
  demo_url: '',
  thumbnail_url: '',
  outcome: '',
};

const AdminProjects: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [tagsInput, setTagsInput] = useState('');
  const [saving, setSaving] = useState(false);

  // Member management modal
  const [managingProjectId, setManagingProjectId] = useState<string | null>(null);
  const [projectMemberIds, setProjectMemberIds] = useState<string[]>([]);

  useEffect(() => {
    if (!isAdmin) { navigate('/admin/login'); return; }
    fetchAll();
  }, [isAdmin, navigate]);

  const fetchAll = async () => {
    setLoading(true);
    const [proj, mem] = await Promise.all([
      supabase.from('projects').select('*, project_members(*, member:members(id, name))').order('created_at', { ascending: false }),
      supabase.from('members').select('*').eq('is_active', true).order('name'),
    ]);
    setProjects((proj.data as Project[]) ?? []);
    setAllMembers(mem.data ?? []);
    setLoading(false);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setTagsInput('');
    setShowForm(true);
  };

  const openEdit = (p: Project) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      description: p.description ?? '',
      type: p.type,
      status: p.status,
      semester: p.semester ?? '',
      start_date: p.start_date ?? '',
      end_date: p.end_date ?? '',
      tags: p.tags ?? [],
      github: p.github ?? '',
      demo_url: p.demo_url ?? '',
      thumbnail_url: p.thumbnail_url ?? '',
      outcome: p.outcome ?? '',
    });
    setTagsInput((p.tags ?? []).join(', '));
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const payload = {
      ...form,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      updated_at: new Date().toISOString(),
    };
    if (editingId) {
      await supabase.from('projects').update(payload).eq('id', editingId);
    } else {
      await supabase.from('projects').insert(payload);
    }
    setSaving(false);
    setShowForm(false);
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('프로젝트를 삭제하시겠습니까?')) return;
    await supabase.from('projects').delete().eq('id', id);
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const advanceStatus = async (p: Project) => {
    const next = STATUS_NEXT[p.status];
    if (!next) return;
    await supabase.from('projects').update({ status: next, updated_at: new Date().toISOString() }).eq('id', p.id);
    setProjects(prev => prev.map(x => x.id === p.id ? { ...x, status: next as Project['status'] } : x));
  };

  const openManageMembers = async (projectId: string) => {
    setManagingProjectId(projectId);
    const { data } = await supabase.from('project_members').select('member_id').eq('project_id', projectId);
    setProjectMemberIds((data ?? []).map((d: { member_id: string }) => d.member_id));
  };

  const toggleMember = async (memberId: string) => {
    if (!managingProjectId) return;
    if (projectMemberIds.includes(memberId)) {
      await supabase.from('project_members').delete().eq('project_id', managingProjectId).eq('member_id', memberId);
      setProjectMemberIds(prev => prev.filter(id => id !== memberId));
    } else {
      await supabase.from('project_members').insert({ project_id: managingProjectId, member_id: memberId });
      setProjectMemberIds(prev => [...prev, memberId]);
    }
    fetchAll();
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <AnimatedSection>
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link to="/admin" className="inline-flex items-center gap-1 text-aing-muted hover:text-aing-text text-sm mb-2 transition-colors">
                <ChevronLeft size={14} />
                Dashboard
              </Link>
              <h1 className="text-2xl font-semibold text-aing-text">Projects 관리</h1>
            </div>
            <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
              <Plus size={14} />
              새 프로젝트
            </button>
          </div>
        </AnimatedSection>

        {/* Form modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="bg-aing-card border border-aing-border rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-aing-text">{editingId ? '프로젝트 수정' : '새 프로젝트'}</h2>
                <button onClick={() => setShowForm(false)} className="text-aing-muted hover:text-aing-text">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-aing-muted block mb-1">제목 *</label>
                  <input
                    className="w-full px-3 py-2 text-sm bg-aing-bg border border-aing-border rounded-xl text-aing-text focus:outline-none focus:border-aing-blue"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="프로젝트 제목"
                  />
                </div>
                <div>
                  <label className="text-xs text-aing-muted block mb-1">설명</label>
                  <textarea
                    className="w-full px-3 py-2 text-sm bg-aing-bg border border-aing-border rounded-xl text-aing-text focus:outline-none focus:border-aing-blue resize-none"
                    rows={3}
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="프로젝트 설명"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-aing-muted block mb-1">타입</label>
                    <select
                      className="w-full px-3 py-2 text-sm bg-aing-bg border border-aing-border rounded-xl text-aing-text focus:outline-none focus:border-aing-blue"
                      value={form.type}
                      onChange={e => setForm(f => ({ ...f, type: e.target.value as Project['type'] }))}
                    >
                      <option value="study">Study</option>
                      <option value="project">Project</option>
                      <option value="research">Research</option>
                      <option value="competition">Competition</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-aing-muted block mb-1">상태</label>
                    <select
                      className="w-full px-3 py-2 text-sm bg-aing-bg border border-aing-border rounded-xl text-aing-text focus:outline-none focus:border-aing-blue"
                      value={form.status}
                      onChange={e => setForm(f => ({ ...f, status: e.target.value as Project['status'] }))}
                    >
                      <option value="planned">진행예정</option>
                      <option value="ongoing">진행중</option>
                      <option value="completed">완료</option>
                      <option value="archived">아카이브</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-aing-muted block mb-1">학기</label>
                  <input
                    className="w-full px-3 py-2 text-sm bg-aing-bg border border-aing-border rounded-xl text-aing-text focus:outline-none focus:border-aing-blue"
                    value={form.semester}
                    onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}
                    placeholder="예: 2026 Spring"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-aing-muted block mb-1">시작일</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 text-sm bg-aing-bg border border-aing-border rounded-xl text-aing-text focus:outline-none focus:border-aing-blue"
                      value={form.start_date}
                      onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-aing-muted block mb-1">종료일</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 text-sm bg-aing-bg border border-aing-border rounded-xl text-aing-text focus:outline-none focus:border-aing-blue"
                      value={form.end_date}
                      onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-aing-muted block mb-1">태그 (쉼표로 구분)</label>
                  <input
                    className="w-full px-3 py-2 text-sm bg-aing-bg border border-aing-border rounded-xl text-aing-text focus:outline-none focus:border-aing-blue"
                    value={tagsInput}
                    onChange={e => setTagsInput(e.target.value)}
                    placeholder="CV, PyTorch, ResNet"
                  />
                </div>
                <div>
                  <label className="text-xs text-aing-muted block mb-1">GitHub URL</label>
                  <input
                    className="w-full px-3 py-2 text-sm bg-aing-bg border border-aing-border rounded-xl text-aing-text focus:outline-none focus:border-aing-blue"
                    value={form.github}
                    onChange={e => setForm(f => ({ ...f, github: e.target.value }))}
                    placeholder="https://github.com/..."
                  />
                </div>
                <div>
                  <label className="text-xs text-aing-muted block mb-1">Demo URL</label>
                  <input
                    className="w-full px-3 py-2 text-sm bg-aing-bg border border-aing-border rounded-xl text-aing-text focus:outline-none focus:border-aing-blue"
                    value={form.demo_url}
                    onChange={e => setForm(f => ({ ...f, demo_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="text-xs text-aing-muted block mb-1">성과 / 결과물</label>
                  <textarea
                    className="w-full px-3 py-2 text-sm bg-aing-bg border border-aing-border rounded-xl text-aing-text focus:outline-none focus:border-aing-blue resize-none"
                    rows={2}
                    value={form.outcome}
                    onChange={e => setForm(f => ({ ...f, outcome: e.target.value }))}
                    placeholder="프로젝트 결과물 또는 성과"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowForm(false)} className="btn-ghost text-sm">취소</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary text-sm flex items-center gap-2">
                  {saving ? '저장 중...' : (<><Check size={14} /> 저장</>)}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Member management modal */}
        {managingProjectId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="bg-aing-card border border-aing-border rounded-2xl w-full max-w-md p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-aing-text">참여 멤버 관리</h2>
                <button onClick={() => setManagingProjectId(null)} className="text-aing-muted hover:text-aing-text">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-2">
                {allMembers.map(m => {
                  const isIn = projectMemberIds.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      onClick={() => toggleMember(m.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${
                        isIn ? 'border-blue-200 bg-blue-50' : 'border-aing-border hover:border-blue-200'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 border border-aing-border flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-aing-text">{m.name[0]?.toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-aing-text truncate">{m.name}</div>
                        <div className="text-xs text-aing-muted">{m.role} · {m.track}</div>
                      </div>
                      {isIn && <Check size={14} className="text-aing-blue shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Project list */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-aing-border rounded w-1/3 mb-2" />
                <div className="h-3 bg-aing-border rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project, i) => {
              const memberCount = project.project_members?.length ?? 0;
              return (
                <AnimatedSection key={project.id} delay={i * 50}>
                  <div className="card">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <h3 className="font-semibold text-aing-text text-sm">{project.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-mono ${TYPE_COLORS[project.type]}`}>
                            {project.type}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[project.status]}`}>
                            {STATUS_LABELS[project.status]}
                          </span>
                        </div>
                        {project.description && (
                          <p className="text-aing-muted text-xs mb-2 line-clamp-1">{project.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-aing-muted">
                          {project.semester && <span>{project.semester}</span>}
                          <span>{memberCount}명 참여</span>
                          {project.github && (
                            <a href={project.github} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-aing-text transition-colors">
                              <Github size={10} /> GitHub
                            </a>
                          )}
                          {project.demo_url && (
                            <a href={project.demo_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-aing-blue transition-colors">
                              <ExternalLink size={10} /> Demo
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {STATUS_NEXT[project.status] && (
                          <button
                            onClick={() => advanceStatus(project)}
                            className="text-xs text-aing-muted hover:text-aing-blue transition-colors flex items-center gap-1 border border-aing-border rounded-lg px-2 py-1"
                            title={`→ ${STATUS_LABELS[STATUS_NEXT[project.status]]}`}
                          >
                            <ChevronRight size={12} />
                            {STATUS_LABELS[STATUS_NEXT[project.status]]}
                          </button>
                        )}
                        <button
                          onClick={() => openManageMembers(project.id)}
                          className="text-xs text-aing-muted hover:text-aing-blue transition-colors p-1"
                          title="멤버 관리"
                        >
                          👥
                        </button>
                        <button
                          onClick={() => openEdit(project)}
                          className="text-aing-muted hover:text-aing-text transition-colors p-1"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="text-aing-muted hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}

            {projects.length === 0 && (
              <div className="text-center py-16">
                <p className="text-aing-muted text-sm mb-4">등록된 프로젝트가 없습니다.</p>
                <button onClick={openCreate} className="btn-primary text-sm">첫 프로젝트 등록</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProjects;
