import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, ChevronDown, ChevronUp, CheckCircle, XCircle,
  Trash2, ArrowLeft, RefreshCw, X, Search
} from 'lucide-react';
import { supabase, TeamPost, TeamApplication } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import AnimatedSection from '../../components/AnimatedSection';

type TeamPostWithApps = TeamPost & { applications?: TeamApplication[] };

const AdminTeamPosts: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<TeamPostWithApps[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) { navigate('/admin/login'); return; }
    fetchPosts();
  }, [isAdmin, navigate]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('team_posts')
        .select('*, applications:team_applications(*)')
        .order('created_at', { ascending: false });
      setPosts(data ?? []);
    } catch {
      setPosts([]);
    }
    setLoading(false);
  };

  const handleToggleStatus = async (post: TeamPostWithApps) => {
    const newStatus = post.status === 'open' ? 'closed' : 'open';
    await supabase.from('team_posts').update({ status: newStatus }).eq('id', post.id);
    fetchPosts();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('이 게시글을 삭제하시겠습니까?')) return;
    await supabase.from('team_posts').delete().eq('id', id);
    fetchPosts();
  };

  const handleAccept = async (appId: string, postId: string) => {
    await supabase.from('team_applications').update({ status: 'accepted' }).eq('id', appId);
    const post = posts.find(p => p.id === postId);
    if (post) {
      await supabase.from('team_posts').update({ current_members: post.current_members + 1 }).eq('id', postId);
    }
    fetchPosts();
  };

  const handleReject = async (appId: string) => {
    await supabase.from('team_applications').update({ status: 'rejected' }).eq('id', appId);
    fetchPosts();
  };

  const handleRemoveApplicant = async (applicationId: string, postId: string) => {
    if (!window.confirm('이 참여자를 제외하시겠습니까?')) return;
    await supabase.from('team_applications').update({ status: 'rejected' }).eq('id', applicationId);
    const post = posts.find(p => p.id === postId);
    if (post) {
      await supabase.from('team_posts').update({ current_members: Math.max(0, (post.current_members || 1) - 1) }).eq('id', postId);
    }
    fetchPosts();
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  const filteredData = search ? posts.filter(item => (item as any).title?.toLowerCase().includes(search.toLowerCase()) || (item as any).author_name?.toLowerCase().includes(search.toLowerCase()) || (item as any).description?.toLowerCase().includes(search.toLowerCase())) : posts;

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <AnimatedSection>
          <div className="flex items-center gap-4 mb-8">
            <Link to="/admin" className="text-aing-muted hover:text-aing-text transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-aing-text">팀원 모집 관리</h1>
          <div className="relative mb-4">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-aing-muted"/>
            <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="제목, 작성자 검색..." className="input-field pl-8 py-1.5 text-xs w-64"/>
          </div>
              <p className="text-aing-muted text-sm mt-0.5">전체 팀원 모집 게시글 및 신청자 관리</p>
            </div>
            <button
              onClick={fetchPosts}
              className="flex items-center gap-2 border border-aing-border text-aing-muted px-3 py-2 rounded-xl text-sm hover:text-aing-text transition-colors"
            >
              <RefreshCw size={14} />
              새로고침
            </button>
          </div>
        </AnimatedSection>

        {/* Summary stats */}
        <AnimatedSection delay={50}>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="card text-center">
              <div className="text-2xl font-semibold text-aing-text mb-1">{posts.length}</div>
              <div className="text-xs text-aing-muted">전체 게시글</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-semibold text-green-600 mb-1">
                {posts.filter(p => p.status === 'open').length}
              </div>
              <div className="text-xs text-aing-muted">모집중</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-semibold text-orange-500 mb-1">
                {posts.reduce((acc, p) => acc + (p.applications || []).filter(a => a.status === 'pending').length, 0)}
              </div>
              <div className="text-xs text-aing-muted">대기중 신청</div>
            </div>
          </div>
        </AnimatedSection>

        {/* Posts list */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card animate-pulse h-20" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-aing-muted text-sm">게시글이 없습니다.</div>
        ) : (
          <div className="space-y-3">
            {filteredData.map((post, i) => {
              const pendingApps = (post.applications || []).filter(a => a.status === 'pending');
              const acceptedApps = (post.applications || []).filter(a => a.status === 'accepted');
              const totalApps = (post.applications || []).length;
              const isExpanded = expandedId === post.id;
              const authorName = post.author_name || '익명';

              return (
                <AnimatedSection key={post.id} delay={i * 30}>
                  <div className="bg-aing-card border border-aing-border rounded-2xl overflow-hidden">
                    <div className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Link
                              to={`/team/${post.id}`}
                              className="font-medium text-aing-text hover:text-aing-blue transition-colors truncate"
                            >
                              {post.title}
                            </Link>
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${
                              post.status === 'open'
                                ? 'bg-green-100 text-green-700 border-green-200'
                                : 'bg-gray-100 text-gray-500 border-gray-200'
                            }`}>
                              {post.status === 'open' ? '모집중' : '마감'}
                            </span>
                            {pendingApps.length > 0 && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 border border-orange-200 font-medium shrink-0">
                                대기 {pendingApps.length}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-aing-muted flex-wrap">
                            <span>작성자: {authorName}</span>
                            <span className="flex items-center gap-1">
                              <Users size={11} />
                              {post.current_members}/{post.max_members}명
                            </span>
                            <span>신청: {totalApps}건 (수락 {acceptedApps.length}건)</span>
                            <span>{formatDate(post.created_at)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleToggleStatus(post)}
                            className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                              post.status === 'open'
                                ? 'border-orange-200 text-orange-600 hover:bg-orange-50'
                                : 'border-green-200 text-green-600 hover:bg-green-50'
                            }`}
                          >
                            {post.status === 'open' ? '마감 처리' : '모집중으로'}
                          </button>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="text-aing-muted hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                          {totalApps > 0 && (
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : post.id)}
                              className="text-aing-muted hover:text-aing-text transition-colors p-1"
                            >
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Applications list (expandable) */}
                    {isExpanded && totalApps > 0 && (
                      <div className="border-t border-aing-border px-5 py-4 bg-aing-bg">
                        <h4 className="text-xs font-semibold text-aing-muted uppercase tracking-wider mb-3">신청자 목록</h4>
                        <div className="space-y-2">
                          {(post.applications || []).map(app => (
                            <div key={app.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-aing-border bg-aing-card">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 ${
                                app.status === 'accepted' ? 'bg-green-500' :
                                app.status === 'rejected' ? 'bg-gray-400' :
                                'bg-orange-400'
                              }`}>
                                {app.applicant_name[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium text-aing-text">{app.applicant_name}</span>
                                {app.message && (
                                  <p className="text-xs text-aing-muted mt-0.5 truncate">{app.message}</p>
                                )}
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${
                                app.status === 'accepted' ? 'bg-green-100 text-green-700 border-green-200' :
                                app.status === 'rejected' ? 'bg-gray-100 text-gray-500 border-gray-200' :
                                'bg-orange-100 text-orange-600 border-orange-200'
                              }`}>
                                {app.status === 'accepted' ? '수락' : app.status === 'rejected' ? '거절' : '대기'}
                              </span>
                              {app.status === 'pending' && (
                                <div className="flex gap-1.5 shrink-0">
                                  <button
                                    onClick={() => handleAccept(app.id, post.id)}
                                    className="text-green-600 hover:text-green-500 transition-colors"
                                    title="수락"
                                  >
                                    <CheckCircle size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleReject(app.id)}
                                    className="text-red-500 hover:text-red-400 transition-colors"
                                    title="거절"
                                  >
                                    <XCircle size={16} />
                                  </button>
                                </div>
                              )}
                              {app.status === 'accepted' && (
                                <button
                                  onClick={() => handleRemoveApplicant(app.id, post.id)}
                                  className="text-red-400 hover:text-red-600 transition-colors shrink-0"
                                  title="제외"
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTeamPosts;
