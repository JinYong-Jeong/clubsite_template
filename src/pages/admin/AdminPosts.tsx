import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Search, PlusCircle, Pencil, Trash2, Pin } from 'lucide-react';
import { supabase, Post } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const CATEGORY_COLORS: Record<string, string> = {
  notice: 'text-red-500 border-red-200 bg-red-50',
  activity: 'text-green-500 border-green-200 bg-green-50',
  study: 'text-aing-blue border-blue-200 bg-aing-blue-light',
  project: 'text-purple-500 border-purple-200 bg-purple-50',
};

const AdminPosts: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) { navigate('/admin/login'); return; }
    fetchPosts();
  }, [isAdmin, navigate]);

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    setPosts(data || []);
    setLoading(false);
  };

  const deletePost = async (id: string) => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    await supabase.from('posts').delete().eq('id', id);
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const togglePin = async (id: string, current: boolean) => {
    await supabase.from('posts').update({ is_pinned: !current }).eq('id', id);
    setPosts(prev => prev.map(p => p.id === id ? { ...p, is_pinned: !current } : p));
  };

  const filteredData = search ? posts.filter(item => (item as any).title?.toLowerCase().includes(search.toLowerCase()) || (item as any).category?.toLowerCase().includes(search.toLowerCase()) || (item as any).author_name?.toLowerCase().includes(search.toLowerCase())) : posts;

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Link to="/admin" className="flex items-center gap-2 text-aing-muted hover:text-aing-text text-sm mb-8 transition-colors">
          <ArrowLeft size={14} />
          Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-aing-text">게시글 관리</h1>
          <div className="relative mb-4">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-aing-muted"/>
            <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="제목, 카테고리 검색..." className="input-field pl-8 py-1.5 text-xs w-64"/>
          </div>
          <Link to="/admin/posts/new" className="btn-primary flex items-center gap-2 text-sm">
            <PlusCircle size={14} />
            새 게시글
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="card animate-pulse h-16" />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="card text-center py-16 text-aing-muted">게시글이 없습니다.</div>
        ) : (
          <div className="space-y-3">
            {filteredData.map(post => (
              <div key={post.id} className="card flex items-center gap-4">
                <span className={`text-xs px-2 py-0.5 rounded-full border font-mono shrink-0 ${CATEGORY_COLORS[post.category]}`}>
                  {post.category}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-aing-text truncate">{post.title}</p>
                  <p className="text-xs text-aing-muted mt-0.5">
                    {new Date(post.created_at).toLocaleDateString('ko-KR')} · 조회 {post.views}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => togglePin(post.id, post.is_pinned)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      post.is_pinned
                        ? 'border-blue-200 text-aing-blue bg-aing-blue-light'
                        : 'border-aing-border text-aing-muted hover:text-aing-blue'
                    }`}
                    title="고정"
                  >
                    <Pin size={14} />
                  </button>
                  <Link
                    to={`/admin/posts/edit/${post.id}`}
                    className="p-1.5 rounded-lg border border-aing-border text-aing-muted hover:text-aing-text hover:border-blue-200 transition-colors"
                  >
                    <Pencil size={14} />
                  </Link>
                  <button
                    onClick={() => deletePost(post.id)}
                    className="p-1.5 rounded-lg border border-aing-border text-aing-muted hover:text-red-500 hover:border-red-200 transition-colors"
                  >
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

export default AdminPosts;
