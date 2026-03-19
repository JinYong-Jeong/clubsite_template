import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, X, Calendar, Search } from 'lucide-react';
import { supabase, Member, TeamPost, TeamApplication } from '../lib/supabase';
import AnimatedSection from '../components/AnimatedSection';
import { useAuth } from '../context/AuthContext';

const TeamPage: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<(TeamPost & { author?: Member; applications?: TeamApplication[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed'>('all');
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    required_skills: '',
    max_members: 4,
    contact: '',
    author_name: '',
    author_password: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Apply modal state
  const [applyTarget, setApplyTarget] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyName, setApplyName] = useState('');
  const [applyPassword, setApplyPassword] = useState('');
  const [applyMessage, setApplyMessage] = useState('');
  const [applyError, setApplyError] = useState('');
  const [applySubmitting, setApplySubmitting] = useState(false);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('team_posts')
        .select('*, author:members(*), applications:team_applications(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPosts(data ?? []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filtered = (filterStatus === 'all' ? posts : posts.filter((p) => p.status === filterStatus))
    .filter(p => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.required_skills || []).some((s: string) => s.toLowerCase().includes(q))
      );
    });
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSubmit = async () => {
    setFormError('');
    if (!form.title.trim() || !form.description.trim()) {
      setFormError('제목과 설명을 입력해주세요.');
      return;
    }
    if (!form.author_name.trim() || !form.author_password.trim()) {
      setFormError('이름과 비밀번호를 입력해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('id, name, password_hash')
        .ilike('name', form.author_name.trim())
        .single();

      if (memberError || !memberData) {
        setFormError('해당 이름의 멤버를 찾을 수 없습니다.');
        setSubmitting(false);
        return;
      }

      if (memberData.password_hash && memberData.password_hash !== form.author_password) {
        setFormError('비밀번호가 틀렸습니다.');
        setSubmitting(false);
        return;
      }

      const skillsArr = form.required_skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const insertPayload: Record<string, unknown> = {
        title: form.title,
        description: form.description,
        required_skills: skillsArr,
        max_members: form.max_members,
        current_members: 1,
        status: 'open',
        contact: form.contact,
        author_id: memberData.id ?? null,
      };

      const { error: insertError } = await supabase.from('team_posts').insert({
        ...insertPayload,
        author_name: form.author_name.trim(),
      });

      if (insertError) {
        const { error: insertError2 } = await supabase.from('team_posts').insert(insertPayload);
        if (insertError2) throw insertError2;
      }

      setForm({
        title: '',
        description: '',
        required_skills: '',
        max_members: 4,
        contact: '',
        author_name: '',
        author_password: '',
      });
      setShowForm(false);
      await fetchPosts();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : '오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApply = async (postId: string) => {
    if (user) {
      if (!window.confirm('참여 희망 신청을 하시겠습니까?')) return;
      const memberName = user.name;
      const memberId = user.member_id || null;
      const { error } = await supabase.from('team_applications').insert({
        team_post_id: postId,
        applicant_id: memberId,
        applicant_name: memberName,
        status: 'pending',
      });
      if (error?.code === '23505') {
        alert('이미 신청하셨습니다.');
      } else if (!error) {
        alert('신청이 완료되었습니다. 작성자의 수락을 기다려주세요.');
        fetchPosts();
      } else {
        alert('신청 중 오류가 발생했습니다.');
      }
    } else {
      setApplyTarget(postId);
      setApplyName('');
      setApplyPassword('');
      setApplyMessage('');
      setApplyError('');
      setShowApplyModal(true);
    }
  };

  const handleApplyModalSubmit = async () => {
    if (!applyTarget) return;
    setApplyError('');
    if (!applyName.trim() || !applyPassword.trim()) {
      setApplyError('이름과 비밀번호를 입력해주세요.');
      return;
    }
    setApplySubmitting(true);
    try {
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('id, name, password_hash')
        .ilike('name', applyName.trim())
        .single();

      if (memberError || !memberData) {
        setApplyError('해당 이름의 멤버를 찾을 수 없습니다.');
        setApplySubmitting(false);
        return;
      }

      if (memberData.password_hash && memberData.password_hash !== applyPassword) {
        setApplyError('비밀번호가 틀렸습니다.');
        setApplySubmitting(false);
        return;
      }

      const { error } = await supabase.from('team_applications').insert({
        team_post_id: applyTarget,
        applicant_id: memberData.id,
        applicant_name: memberData.name,
        message: applyMessage.trim() || null,
        status: 'pending',
      });

      if (error?.code === '23505') {
        setApplyError('이미 신청하셨습니다.');
      } else if (!error) {
        setShowApplyModal(false);
        alert('신청이 완료되었습니다. 작성자의 수락을 기다려주세요.');
        fetchPosts();
      } else {
        setApplyError('신청 중 오류가 발생했습니다.');
      }
    } catch {
      setApplyError('신청 중 오류가 발생했습니다.');
    }
    setApplySubmitting(false);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  const getAcceptedCount = (post: TeamPost & { applications?: TeamApplication[] }) => {
    return (post.applications || []).filter(a => a.status === 'accepted').length;
  };

  const isMyPost = (post: TeamPost) => {
    if (!user) return false;
    if (user.member_id && post.author_id === user.member_id) return true;
    if (post.author_name && post.author_name === user.name) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      {/* Header */}
      <section className="py-20 px-6 border-b border-aing-border">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 tag-blue mb-6">
              <Users size={12} />
              <span>Team Recruitment</span>
            </div>
            <h1 className="section-title text-5xl mb-4">
              <span className="text-gradient">팀원 모집</span>
            </h1>
            <p className="section-subtitle">함께 프로젝트를 진행할 팀원을 구해보세요</p>
          </AnimatedSection>
        </div>
      </section>

      {/* Filter + New Post Button */}
      <section className="py-6 px-6 border-b border-aing-border sticky top-16 z-30 glass">
        <div className="max-w-4xl mx-auto flex items-center gap-3 flex-wrap">
          {(['all', 'open', 'closed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filterStatus === f
                  ? 'bg-aing-dark text-white'
                  : 'border border-aing-border text-aing-muted hover:border-aing-blue hover:text-aing-blue'
              }`}
            >
              {f === 'all' ? '전체' : f === 'open' ? '모집중' : '마감'}
            </button>
          ))}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-aing-muted" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="검색..." className="input-field pl-8 py-1.5 text-xs w-40" />
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="ml-auto flex items-center gap-1.5 bg-aing-blue text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={14} />
            모집 글 작성
          </button>
        </div>
      </section>

      {/* Posts */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="card animate-pulse h-32" />
            ))
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-aing-muted text-sm">
              모집 글이 없습니다.
            </div>
          ) : (
            paginated.map((post, i) => {
              const acceptedApps = (post.applications || []).filter(a => a.status === 'accepted');
              const acceptedCount = getAcceptedCount(post);
              const filled = post.current_members + acceptedCount;
              const authorName = post.author_name || post.author?.name || '익명';
              const myPost = isMyPost(post);

              return (
                <AnimatedSection key={post.id} delay={i * 50}>
                  <div className="bg-aing-card border border-aing-border rounded-2xl p-6 hover:border-blue-200 transition-colors">
                    {/* Top row: badges */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                          post.status === 'open'
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-gray-100 text-gray-500 border-gray-200'
                        }`}
                      >
                        {post.status === 'open' ? '모집중' : '마감'}
                      </span>
                      {myPost && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200 font-medium">
                          내 글
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <Link to={`/team/${post.id}`}>
                      <h3 className="font-semibold text-aing-text hover:text-aing-blue transition-colors mb-1 cursor-pointer">
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-aing-muted text-sm leading-relaxed line-clamp-2 mb-3">{post.description}</p>

                    {/* Skills */}
                    {post.required_skills && post.required_skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {post.required_skills.map((s, idx) => (
                          <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-200">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Members visualization */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: post.max_members }).map((_, idx) => {
                          const app = acceptedApps[idx - 1];
                          if (idx === 0) {
                            // Author slot (always filled)
                            return (
                              <div key={idx} className="w-7 h-7 rounded-full bg-aing-blue border-2 border-aing-blue flex items-center justify-center text-white text-xs font-semibold" title={authorName}>
                                {authorName[0]}
                              </div>
                            );
                          } else if (app) {
                            return (
                              <div key={idx} className="w-7 h-7 rounded-full bg-green-500 border-2 border-green-500 flex items-center justify-center text-white text-xs font-semibold" title={app.applicant_name}>
                                {app.applicant_name[0]}
                              </div>
                            );
                          } else {
                            return (
                              <div key={idx} className="w-7 h-7 rounded-full bg-white border-2 border-aing-border flex items-center justify-center">
                                <span className="text-aing-muted text-xs">○</span>
                              </div>
                            );
                          }
                        })}
                      </div>
                      <span className="text-xs text-aing-muted">
                        {Math.min(filled, post.max_members)}/{post.max_members}명
                      </span>
                      <span className="text-xs text-aing-muted ml-auto">작성자: {authorName}</span>
                    </div>

                    {/* Actions row */}
                    <div className="flex items-center gap-3 flex-wrap">
                      {!myPost ? (
                        <button
                          onClick={() => handleApply(post.id)}
                          disabled={post.status === 'closed'}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-aing-blue text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                        >
                          <Users size={11} />
                          참여 희망
                        </button>
                      ) : (
                        <span className="text-xs text-aing-muted">내가 작성한 글입니다</span>
                      )}
                      <Link
                        to={`/team/${post.id}`}
                        className="flex items-center gap-1 text-xs text-aing-blue hover:opacity-80 transition-opacity font-medium"
                      >
                        자세히 보기 →
                      </Link>
                      <span className="flex items-center gap-1 text-xs text-aing-muted ml-auto">
                        <Calendar size={11} />
                        {formatDate(post.created_at)}
                      </span>
                    </div>
                  </div>
                </AnimatedSection>
              );
            })
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-8">
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-40">← 이전</button>
              {Array.from({length:totalPages},(_,i)=>i+1).map(n=>(
                <button key={n} onClick={()=>setPage(n)} className={"text-xs px-3 py-1.5 rounded-lg border transition-all " + (page===n?'bg-aing-dark text-white':'border-aing-border text-aing-muted hover:border-aing-blue')}>{n}</button>
              ))}
              <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-40">다음 →</button>
            </div>
          )}
          <div className="flex justify-end mt-2">
            <select value={pageSize} onChange={e=>{setPageSize(Number(e.target.value));setPage(1);}} className="input-field py-1 text-xs w-20">
              <option value={5}>5개</option>
              <option value={10}>10개</option>
              <option value={20}>20개</option>
            </select>
          </div>
        </div>
      </section>

      {/* New Post Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-aing-card border border-aing-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-aing-text">팀원 모집 글 작성</h2>
              <button onClick={() => setShowForm(false)} className="text-aing-muted hover:text-aing-text">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-aing-muted mb-1 block">제목 *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="프로젝트 제목"
                  className="w-full border border-aing-border rounded-xl px-3 py-2 text-sm text-aing-text bg-aing-bg outline-none focus:border-aing-blue"
                />
              </div>
              <div>
                <label className="text-xs text-aing-muted mb-1 block">설명 *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="프로젝트 설명, 원하는 팀원 등을 적어주세요"
                  rows={3}
                  className="w-full border border-aing-border rounded-xl px-3 py-2 text-sm text-aing-text bg-aing-bg outline-none focus:border-aing-blue resize-none"
                />
              </div>
              <div>
                <label className="text-xs text-aing-muted mb-1 block">필요 스킬 (쉼표 구분)</label>
                <input
                  type="text"
                  value={form.required_skills}
                  onChange={(e) => setForm({ ...form, required_skills: e.target.value })}
                  placeholder="Python, PyTorch, React"
                  className="w-full border border-aing-border rounded-xl px-3 py-2 text-sm text-aing-text bg-aing-bg outline-none focus:border-aing-blue"
                />
              </div>
              <div>
                <label className="text-xs text-aing-muted mb-1 block">모집 인원</label>
                <input
                  type="number"
                  value={form.max_members}
                  onChange={(e) => setForm({ ...form, max_members: Number(e.target.value) })}
                  min={2}
                  max={10}
                  className="w-full border border-aing-border rounded-xl px-3 py-2 text-sm text-aing-text bg-aing-bg outline-none focus:border-aing-blue"
                />
              </div>
              <div>
                <label className="text-xs text-aing-muted mb-1 block">연락수단</label>
                <input
                  type="text"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  placeholder="연락수단 링크 또는 이메일"
                  className="w-full border border-aing-border rounded-xl px-3 py-2 text-sm text-aing-text bg-aing-bg outline-none focus:border-aing-blue"
                />
              </div>
              <div className="border-t border-aing-border pt-3">
                <p className="text-xs text-aing-muted mb-3">본인 확인</p>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={form.author_name}
                    onChange={(e) => setForm({ ...form, author_name: e.target.value })}
                    placeholder="이름 (멤버 등록 이름과 동일)"
                    className="w-full border border-aing-border rounded-xl px-3 py-2 text-sm text-aing-text bg-aing-bg outline-none focus:border-aing-blue"
                  />
                  <input
                    type="password"
                    value={form.author_password}
                    onChange={(e) => setForm({ ...form, author_password: e.target.value })}
                    placeholder="비밀번호"
                    className="w-full border border-aing-border rounded-xl px-3 py-2 text-sm text-aing-text bg-aing-bg outline-none focus:border-aing-blue"
                  />
                </div>
              </div>
              {formError && <p className="text-red-500 text-xs">{formError}</p>}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-aing-blue text-white rounded-xl py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? '작성 중...' : '작성하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal (비로그인) */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-aing-card border border-aing-border rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-aing-text">참여 희망 신청</h2>
              <button onClick={() => setShowApplyModal(false)} className="text-aing-muted hover:text-aing-text">
                <X size={18} />
              </button>
            </div>
            <p className="text-aing-muted text-xs mb-4">멤버 확인을 위해 이름과 비밀번호를 입력해주세요.</p>
            <div className="space-y-3">
              <input
                type="text"
                value={applyName}
                onChange={(e) => setApplyName(e.target.value)}
                placeholder="이름"
                className="w-full border border-aing-border rounded-xl px-3 py-2 text-sm text-aing-text bg-aing-bg outline-none focus:border-aing-blue"
              />
              <input
                type="password"
                value={applyPassword}
                onChange={(e) => setApplyPassword(e.target.value)}
                placeholder="비밀번호"
                className="w-full border border-aing-border rounded-xl px-3 py-2 text-sm text-aing-text bg-aing-bg outline-none focus:border-aing-blue"
              />
              <textarea
                value={applyMessage}
                onChange={(e) => setApplyMessage(e.target.value)}
                placeholder="신청 메시지 (선택)"
                rows={2}
                className="w-full border border-aing-border rounded-xl px-3 py-2 text-sm text-aing-text bg-aing-bg outline-none focus:border-aing-blue resize-none"
              />
              {applyError && <p className="text-red-500 text-xs">{applyError}</p>}
              <button
                onClick={handleApplyModalSubmit}
                disabled={applySubmitting}
                className="w-full bg-aing-blue text-white rounded-xl py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {applySubmitting ? '신청 중...' : '신청하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPage;
