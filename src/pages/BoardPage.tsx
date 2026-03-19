import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Eye, Pin, ChevronRight, Search, PlusCircle, Heart, Download, X } from 'lucide-react';
import { supabase, Post, Comment } from '../lib/supabase';
import AnimatedSection from '../components/AnimatedSection';
import { useAuth } from '../context/AuthContext';

const CATEGORY_LABELS: Record<string, string> = {
  notice: 'Notice', activity: 'Activity', study: 'Study', project: 'Project',
};

const CATEGORY_COLORS: Record<string, string> = {
  notice: 'text-red-500 border-red-200 bg-red-50',
  activity: 'text-green-500 border-green-200 bg-green-50',
  study: 'text-aing-blue border-blue-200 bg-aing-blue-light',
  project: 'text-purple-500 border-purple-200 bg-purple-50',
};

const AVATAR_COLORS = [
  'from-aing-blue/40 to-blue-400/40',
  'from-purple-400/40 to-pink-400/40',
  'from-green-400/40 to-emerald-400/40',
  'from-amber-400/40 to-orange-400/40',
];

const demoPosts: Post[] = [
  { id: '1', title: '[공지] 2026 Spring 신규 부원 모집 안내', content: '안녕하세요, A.ing입니다.', author_id: null, category: 'notice', tags: ['모집', '2026'], is_pinned: true, views: 120, created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' },
  { id: '2', title: 'ResNet 구현 스터디 1주차 후기', content: 'ResNet-50을 직접 구현하며...', author_id: null, author_name: 'test', category: 'study', tags: ['ResNet', 'CV', 'PyTorch'], is_pinned: false, views: 45, created_at: '2026-03-10T00:00:00Z', updated_at: '2026-03-10T00:00:00Z' },
  { id: '3', title: 'Transformer Study 킥오프 세션 정리', content: 'Attention is All You Need...', author_id: null, author_name: 'test', category: 'study', tags: ['Transformer', 'NLP'], is_pinned: false, views: 67, created_at: '2026-03-08T00:00:00Z', updated_at: '2026-03-08T00:00:00Z' },
  { id: '4', title: '26-Spring Senior Session 프로젝트 소개', content: '이번 학기 시니어 트랙...', author_id: null, category: 'activity', tags: ['Senior', 'Project'], is_pinned: false, views: 88, created_at: '2026-03-05T00:00:00Z', updated_at: '2026-03-05T00:00:00Z' },
];

function getLikes(postId: string): number {
  try { return parseInt(localStorage.getItem(`like_${postId}`) || '0'); } catch { return 0; }
}
function setLikes(postId: string, count: number) {
  try { localStorage.setItem(`like_${postId}`, String(count)); } catch {}
}
function hasLiked(postId: string): boolean {
  try { return localStorage.getItem(`liked_${postId}`) === '1'; } catch { return false; }
}
function setHasLiked(postId: string, v: boolean) {
  try { v ? localStorage.setItem(`liked_${postId}`, '1') : localStorage.removeItem(`liked_${postId}`); } catch {}
}

function formatDatetime(d: string) {
  return new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function generateMD(posts: Post[], commentsMap: Record<string, Comment[]>): string {
  return posts.map(post => {
    const date = formatDatetime(post.created_at);
    const tagStr = (post.tags || []).map(t => `#${t}`).join(' ');
    const cmts = commentsMap[post.id] || [];
    const cmtSection = cmts.length > 0
      ? `\n\n## 댓글 (${cmts.length}개)\n\n` + cmts.map(c =>
          `### ${c.author_name} · ${formatDatetime(c.created_at)}\n${c.content}`
        ).join('\n\n')
      : '';
    return `# ${post.title}\n\n**작성일**: ${date}\n**카테고리**: ${CATEGORY_LABELS[post.category] || post.category}\n**태그**: ${tagStr}\n\n---\n\n${post.content}${cmtSection}`;
  }).join('\n\n---\n\n');
}

const BoardPage: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'notice' | 'activity' | 'study' | 'project'>('all');
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  // MD export state
  const [showExport, setShowExport] = useState(false);
  const [exportSelected, setExportSelected] = useState<Set<string>>(new Set());
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*, author:members(name)')
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false });
        const loaded = (!error && data && data.length > 0) ? data as Post[] : demoPosts;
        setPosts(loaded);

        // Load like counts from localStorage
        const lc: Record<string, number> = {};
        const lp: Record<string, boolean> = {};
        loaded.forEach(p => { lc[p.id] = getLikes(p.id); lp[p.id] = hasLiked(p.id); });
        setLikeCounts(lc);
        setLikedPosts(lp);

        // Fetch comment counts
        const ids = loaded.map(p => p.id);
        if (ids.length > 0) {
          const { data: cmtData } = await supabase
            .from('comments')
            .select('post_id')
            .in('post_id', ids);
          if (cmtData) {
            const cc: Record<string, number> = {};
            cmtData.forEach((c: any) => { cc[c.post_id] = (cc[c.post_id] || 0) + 1; });
            setCommentCounts(cc);
          }
        }
      } catch {
        setPosts(demoPosts);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const toggleLike = (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const liked = likedPosts[postId];
    const current = likeCounts[postId] || 0;
    const next = liked ? Math.max(0, current - 1) : current + 1;
    setLikeCounts(p => ({ ...p, [postId]: next }));
    setLikedPosts(p => ({ ...p, [postId]: !liked }));
    setLikes(postId, next);
    setHasLiked(postId, !liked);
  };

  const filtered = posts
    .filter(p => filter === 'all' || p.category === filter)
    .filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const myStudyPosts = posts.filter(p => p.category === 'study' && (p.author_name === user?.name || (p as any).author?.name === user?.name));

  const formatDate = (d: string) => new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });

  const handleExportConfirm = async () => {
    if (exportSelected.size === 0) return;
    setExportLoading(true);
    try {
      const selectedPosts = posts.filter(p => exportSelected.has(p.id));
      const commentsMap: Record<string, Comment[]> = {};
      for (const post of selectedPosts) {
        const { data } = await supabase.from('comments').select('*').eq('post_id', post.id).order('created_at');
        commentsMap[post.id] = (data as Comment[]) || [];
      }
      const md = generateMD(selectedPosts, commentsMap);
      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aing-study-export-${new Date().toISOString().slice(0,10)}.md`;
      a.click();
      URL.revokeObjectURL(url);
      setShowExport(false);
      setExportSelected(new Set());
    } catch {}
    setExportLoading(false);
  };

  const getAuthorName = (post: Post): string | undefined => post.author_name || (post as any).author?.name;

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      {/* MD Export Modal */}
      {showExport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl border border-aing-border shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-aing-text">내 Study 글 내보내기 (.md)</h3>
                <button onClick={() => setShowExport(false)}><X size={16} className="text-aing-muted" /></button>
              </div>
              {myStudyPosts.length === 0 ? (
                <p className="text-sm text-aing-muted py-4 text-center">내보낼 Study 게시글이 없습니다.</p>
              ) : (
                <>
                  <p className="text-xs text-aing-muted">내보낼 게시글을 선택하세요. 댓글 포함 .md 파일로 다운로드됩니다.</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs text-aing-muted cursor-pointer hover:text-aing-text">
                      <input
                        type="checkbox"
                        checked={exportSelected.size === myStudyPosts.length}
                        onChange={e => setExportSelected(e.target.checked ? new Set(myStudyPosts.map(p => p.id)) : new Set())}
                      />
                      전체 선택
                    </label>
                    <div className="border-t border-aing-border pt-2 space-y-2">
                      {myStudyPosts.map(p => (
                        <label key={p.id} className="flex items-start gap-2 text-xs cursor-pointer hover:text-aing-text group">
                          <input
                            type="checkbox"
                            checked={exportSelected.has(p.id)}
                            onChange={e => {
                              const s = new Set(exportSelected);
                              e.target.checked ? s.add(p.id) : s.delete(p.id);
                              setExportSelected(s);
                            }}
                            className="mt-0.5"
                          />
                          <div>
                            <span className="text-aing-text group-hover:text-aing-blue transition-colors">{p.title}</span>
                            <span className="block text-aing-muted">{formatDate(p.created_at)}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleExportConfirm}
                      disabled={exportSelected.size === 0 || exportLoading}
                      className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50"
                    >
                      <Download size={14} />
                      {exportLoading ? '생성 중...' : `다운로드 (${exportSelected.size}개)`}
                    </button>
                    <button onClick={() => setShowExport(false)} className="btn-ghost text-sm">취소</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <section className="py-20 px-6 border-b border-aing-border">
        <div className="max-w-4xl mx-auto flex items-start justify-between flex-wrap gap-4">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 tag-blue mb-6">
              <MessageSquare size={12} />
              <span>Community</span>
            </div>
            <h1 className="section-title text-5xl mb-4">
              <span className="text-gradient">Community</span>
            </h1>
            <p className="section-subtitle">공지사항, 활동 후기, 스터디 자료를 공유합니다.</p>
          </AnimatedSection>
          <div className="flex items-center gap-2 mt-auto flex-wrap">
            {user && (
              <button
                onClick={() => setShowExport(true)}
                className="btn-ghost flex items-center gap-2 text-sm"
                title="내 Study 글 .md로 내보내기"
              >
                <Download size={14} />
                Study 내보내기
              </button>
            )}
            <Link to="/board/new" className="btn-primary flex items-center gap-2 text-sm">
              <PlusCircle size={16} />
              새 글 작성
            </Link>
          </div>
</div>
      </section>

      {/* Controls */}
      <section className="py-6 px-6 border-b border-aing-border sticky top-16 z-30 glass">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2 overflow-x-auto shrink-0">
            {(['all', 'notice', 'activity', 'study', 'project'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filter === f ? 'bg-aing-dark text-white' : 'border border-aing-border text-aing-muted hover:border-aing-blue hover:text-aing-blue'
                }`}
              >
                {f === 'all' ? 'All' : CATEGORY_LABELS[f]}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 border border-aing-border rounded-xl px-3 py-2 bg-white w-full sm:w-64 ml-auto">
            <select value={pageSize} onChange={e=>{setPageSize(Number(e.target.value));setPage(1);}} className="input-field py-1 text-xs w-20 mr-2">
              <option value={5}>5개</option>
              <option value={10}>10개</option>
              <option value={20}>20개</option>
            </select>
            <Search size={14} className="text-aing-muted shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-sm text-aing-text placeholder-aing-muted focus:outline-none w-full"
            />
          </div>
        </div>
      </section>

      {/* Posts */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="card animate-pulse h-20" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 text-aing-muted">
              <MessageSquare size={40} className="mx-auto mb-4 opacity-30" />
              <p>게시글이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paginated.map((post, i) => {
                const authorName = getAuthorName(post);
                const colorIdx = authorName ? authorName.charCodeAt(0) % AVATAR_COLORS.length : 0;
                return (
                  <AnimatedSection key={post.id} delay={i * 50}>
                    <Link
                      to={`/board/${post.id}`}
                      className="card flex items-center gap-3 hover:border-blue-200 group cursor-pointer"
                    >
                      {post.is_pinned && <Pin size={14} className="text-aing-blue shrink-0" />}

                      <span className={`text-xs px-2 py-0.5 rounded-full border font-mono shrink-0 ${CATEGORY_COLORS[post.category]}`}>
                        {CATEGORY_LABELS[post.category]}
                      </span>

                      {/* Author avatar */}
                      {authorName ? (
                        <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${AVATAR_COLORS[colorIdx]} border border-aing-border flex items-center justify-center shrink-0`}>
                          <span className="text-xs font-semibold text-aing-text">{authorName[0].toUpperCase()}</span>
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-aing-border/60 to-aing-border border border-aing-border flex items-center justify-center shrink-0">
                          <span className="text-xs text-aing-muted">?</span>
                        </div>
                      )}

                      {/* Title */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-aing-text truncate group-hover:text-aing-blue transition-colors">
                          {post.title}
                        </h3>
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex gap-1 mt-0.5 overflow-hidden">
                            {post.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="text-xs text-aing-muted font-mono">#{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-3 text-xs text-aing-muted shrink-0">
                        <span className="hidden md:flex items-center gap-1">
                          <Eye size={12} />{post.views}
                        </span>
                        {/* Comment count */}
                        <span className="flex items-center gap-1">
                          <MessageSquare size={12} />{commentCounts[post.id] || 0}
                        </span>
                        {/* Like button */}
                        <button
                          onClick={e => toggleLike(e, post.id)}
                          className={`flex items-center gap-1 transition-colors ${likedPosts[post.id] ? 'text-red-400' : 'hover:text-red-400'}`}
                          title="좋아요"
                        >
                          <Heart size={12} className={likedPosts[post.id] ? 'fill-current' : ''} />
                          <span>{likeCounts[post.id] || 0}</span>
                        </button>
                        <span className="hidden sm:block">{formatDate(post.created_at)}{authorName ? ` · ${authorName}` : ''}</span>
                        <ChevronRight size={14} className="text-aing-muted group-hover:text-aing-blue transition-colors" />
                      </div>
                    </Link>
                  </AnimatedSection>
                );
              })}
            </div>
          )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-8">
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-40">← 이전</button>
          {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
            <button key={p} onClick={()=>setPage(p)} className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${page===p?'bg-aing-dark text-white':'border-aing-border text-aing-muted hover:border-aing-blue'}`}>{p}</button>
          ))}
          <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-40">다음 →</button>
        </div>
      )}
    </div>
      </section>
    </div>
  );
};

export default BoardPage;