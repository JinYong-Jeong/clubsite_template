import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Search, XCircle, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const AdminComments: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) { navigate('/admin/login'); return; }
    fetchComments();
  }, [isAdmin, navigate]);

  const fetchComments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false });
    setComments(data || []);
    setLoading(false);
  };

  const remove = async (id: string) => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    await supabase.from('comments').delete().eq('id', id);
    setComments(prev => prev.filter(c => c.id !== id));
  };

  const filteredData = search ? comments.filter(item => (item as any).content?.toLowerCase().includes(search.toLowerCase()) || (item as any).author_name?.toLowerCase().includes(search.toLowerCase())) : comments;

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link to="/admin" className="flex items-center gap-2 text-aing-muted hover:text-aing-text text-sm mb-8 transition-colors">
          <ArrowLeft size={14} />
          Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-aing-text">댓글 관리</h1>
          <div className="relative mb-4">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-aing-muted"/>
            <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="내용, 작성자 검색..." className="input-field pl-8 py-1.5 text-xs w-64"/>
          </div>
          <span className="text-sm text-aing-muted">{comments.length}개</span>
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="card animate-pulse h-20" />)}</div>
        ) : comments.length === 0 ? (
          <div className="card text-center py-16">
            <MessageSquare size={32} className="text-aing-muted mx-auto mb-4 opacity-30" />
            <p className="text-aing-muted text-sm">댓글이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredData.map(c => (
              <div key={c.id} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-aing-text">{c.author_name}</span>
                      <span className="text-xs text-aing-muted ml-auto">
                        {new Date(c.created_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    {c.author_email && (
                      <p className="text-xs text-aing-blue mb-1">{c.author_email}</p>
                    )}
                    <p className="text-sm text-aing-muted leading-relaxed">{c.content}</p>
                  </div>
                  <button onClick={() => remove(c.id)}
                    className="p-1.5 rounded-lg border border-aing-border text-aing-muted hover:text-red-500 hover:border-red-300 transition-colors shrink-0">
                    <XCircle size={14} />
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

export default AdminComments;
