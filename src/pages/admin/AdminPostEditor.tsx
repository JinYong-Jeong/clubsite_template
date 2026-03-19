import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Tag } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

type Category = 'notice' | 'activity' | 'study' | 'project';

const AdminPostEditor: React.FC = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'notice' as Category,
    tags: '',
    is_pinned: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin) { navigate('/admin/login'); return; }
    if (isEdit && id) {
      supabase.from('posts').select('*').eq('id', id).single().then(({ data }) => {
        if (data) {
          setForm({
            title: data.title,
            content: data.content,
            category: data.category,
            tags: (data.tags || []).join(', '),
            is_pinned: data.is_pinned,
          });
        }
      });
    }
  }, [id, isEdit, isAdmin, navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title: form.title,
      content: form.content,
      category: form.category,
      tags: form.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      is_pinned: form.is_pinned,
      author_id: null,
      updated_at: new Date().toISOString(),
    };
    try {
      if (isEdit && id) {
        const { error } = await supabase.from('posts').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('posts').insert({ ...payload, views: 0, created_at: new Date().toISOString() });
        if (error) throw error;
      }
      navigate('/admin/posts');
    } catch(err) {
      console.error('Save error:', err);
      alert('저장 실패: ' + (err as any)?.message);
    }
    setSaving(false);
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link to="/admin" className="flex items-center gap-2 text-aing-muted hover:text-aing-text text-sm mb-8 transition-colors">
          <ArrowLeft size={14} />
          Admin
        </Link>

        <h1 className="text-2xl font-semibold text-aing-text mb-8">
          {isEdit ? '게시글 수정' : '새 게시글 작성'}
        </h1>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="card space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs text-aing-muted mb-2">제목 *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                className="input-field text-lg font-medium"
                placeholder="게시글 제목"
                required
              />
            </div>

            {/* Category + Pinned */}
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-32">
                <label className="block text-xs text-aing-muted mb-2">카테고리</label>
                <select
                  value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value as Category }))}
                  className="input-field"
                >
                  <option value="notice">Notice</option>
                  <option value="activity">Activity</option>
                  <option value="study">Study</option>
                  <option value="project">Project</option>
                </select>
              </div>
              <div className="flex items-end pb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_pinned}
                    onChange={e => setForm(p => ({ ...p, is_pinned: e.target.checked }))}
                    className="w-4 h-4 accent-aing-blue"
                  />
                  <span className="text-sm text-aing-muted">공지 고정</span>
                </label>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs text-aing-muted mb-2">
                <Tag size={10} className="inline mr-1" />
                태그 (쉼표로 구분)
              </label>
              <input
                type="text"
                value={form.tags}
                onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                className="input-field"
                placeholder="ResNet, CV, PyTorch"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-xs text-aing-muted mb-2">내용 * (Markdown 지원)</label>
              <textarea
                value={form.content}
                onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                className="input-field resize-none font-mono text-sm"
                rows={16}
                placeholder="# 제목&#10;&#10;내용을 작성하세요..."
                required
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={14} />
              {saving ? '저장 중...' : (isEdit ? '수정 완료' : '게시하기')}
            </button>
            <Link to="/board" className="btn-ghost">
              취소
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPostEditor;
