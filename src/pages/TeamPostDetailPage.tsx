import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, MessageSquare, Calendar, Trash2, Pencil, CheckCircle, XCircle, X } from 'lucide-react';
import { supabase, TeamPost, Member, TeamApplication } from '../lib/supabase';
import AnimatedSection from '../components/AnimatedSection';
import { useAuth } from '../context/AuthContext';

const TeamPostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState<(TeamPost & { author?: Member; applications?: TeamApplication[] }) | null>(null);
  const [loading, setLoading] = useState(true);

  // Delete state
  const [showDelete, setShowDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Edit state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAuthPassword, setEditAuthPassword] = useState('');
  const [editAuthError, setEditAuthError] = useState('');
  const [editAuthChecked, setEditAuthChecked] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    required_skills: '',
    max_members: 4,
    contact: '',
    status: 'open' as 'open' | 'closed',
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');

  // Apply state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyName, setApplyName] = useState('');
  const [applyPassword, setApplyPassword] = useState('');
  const [applyMessage, setApplyMessage] = useState('');
  const [applyError, setApplyError] = useState('');
  const [applySubmitting, setApplySubmitting] = useState(false);

  // Author auth for managing applications
  const [showAuthorAuth, setShowAuthorAuth] = useState(false);
  const [authorAuthPassword, setAuthorAuthPassword] = useState('');
  const [authorAuthError, setAuthorAuthError] = useState('');
  const [isAuthorVerified, setIsAuthorVerified] = useState(false);

  const fetchPost = async () => {
    const { data } = await supabase
      .from('team_posts')
      .select('*, author:members(id, name, avatar_url, track, role), applications:team_applications(*)')
      .eq('id', id)
      .single();
    setPost(data || null);
    setLoading(false);
  };

  useEffect(() => {
    const loadPost = async () => {
      const { data } = await supabase
        .from('team_posts')
        .select('*, author:members(id, name, avatar_url, track, role), applications:team_applications(*)')
        .eq('id', id)
        .single();
      setPost(data || null);
      setLoading(false);
    };
    loadPost();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isAdminUser = user?.role === 'admin';
  const isAuthor = !!(user && post && (
    (user.member_id && post.author_id === user.member_id) ||
    (post.author_name && post.author_name === user.name)
  ));
  const canManage = isAdminUser || isAuthor || isAuthorVerified;

  const acceptedApplications = (post?.applications || []).filter(a => a.status === 'accepted');
  const pendingApplications = (post?.applications || []).filter(a => a.status === 'pending');

  const handleDelete = async () => {
    if (!post) return;
    setDeleting(true);
    setDeleteError('');
    try {
      if (!isAdminUser) {
        const authorName = post.author_name || post.author?.name;
        if (authorName) {
          const { data: member } = await supabase
            .from('members')
            .select('password_hash')
            .ilike('name', authorName)
            .single();
          if (member?.password_hash && member.password_hash !== deletePassword) {
            setDeleteError('비밀번호가 틀렸습니다.');
            setDeleting(false);
            return;
          }
        }
      }
      await supabase.from('team_posts').delete().eq('id', id);
      navigate('/team');
    } catch {
      setDeleteError('삭제 중 오류가 발생했습니다.');
    }
    setDeleting(false);
  };

  const openEditModal = () => {
    if (!post) return;
    setEditAuthChecked(isAdminUser || isAuthor);
    setEditAuthPassword('');
    setEditAuthError('');
    setEditError('');
    setEditForm({
      title: post.title,
      description: post.description,
      required_skills: (post.required_skills || []).join(', '),
      max_members: post.max_members,
      contact: post.contact || '',
      status: post.status,
    });
    setShowEditModal(true);
  };

  const handleEditAuthCheck = async () => {
    if (!post) return;
    const authorName = post.author_name || post.author?.name;
    if (!authorName) { setEditAuthChecked(true); return; }
    const { data: member } = await supabase
      .from('members')
      .select('password_hash')
      .ilike('name', authorName)
      .single();
    if (member?.password_hash && member.password_hash !== editAuthPassword) {
      setEditAuthError('비밀번호가 틀렸습니다.');
      return;
    }
    setEditAuthChecked(true);
  };

  const handleEditSubmit = async () => {
    if (!post) return;
    setEditError('');
    if (!editForm.title.trim() || !editForm.description.trim()) {
      setEditError('제목과 설명을 입력해주세요.');
      return;
    }
    setEditSubmitting(true);
    try {
      const skillsArr = editForm.required_skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const { error } = await supabase.from('team_posts').update({
        title: editForm.title,
        description: editForm.description,
        required_skills: skillsArr,
        max_members: editForm.max_members,
        contact: editForm.contact,
        status: editForm.status,
      }).eq('id', post.id);
      if (error) throw error;
      setShowEditModal(false);
      await fetchPost();
    } catch (e: unknown) {
      setEditError(e instanceof Error ? e.message : '수정 중 오류가 발생했습니다.');
    }
    setEditSubmitting(false);
  };

  const handleApply = async () => {
    if (user) {
      if (!window.confirm('참여 희망 신청을 하시겠습니까?')) return;
      const { error } = await supabase.from('team_applications').insert({
        team_post_id: id,
        applicant_id: user.member_id || null,
        applicant_name: user.name,
        status: 'pending',
      });
      if (error?.code === '23505') {
        alert('이미 신청하셨습니다.');
      } else if (!error) {
        alert('신청이 완료되었습니다. 작성자의 수락을 기다려주세요.');
        fetchPost();
      }
    } else {
      setApplyName('');
      setApplyPassword('');
      setApplyMessage('');
      setApplyError('');
      setShowApplyModal(true);
    }
  };

  const handleApplyModalSubmit = async () => {
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
        team_post_id: id,
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
        fetchPost();
      } else {
        setApplyError('신청 중 오류가 발생했습니다.');
      }
    } catch {
      setApplyError('신청 중 오류가 발생했습니다.');
    }
    setApplySubmitting(false);
  };

  const handleAuthorAuthVerify = async () => {
    if (!post) return;
    setAuthorAuthError('');
    const authorName = post.author_name || post.author?.name;
    if (!authorName) { setIsAuthorVerified(true); setShowAuthorAuth(false); return; }
    const { data: member } = await supabase
      .from('members')
      .select('password_hash')
      .ilike('name', authorName)
      .single();
    if (member?.password_hash && member.password_hash !== authorAuthPassword) {
      setAuthorAuthError('비밀번호가 틀렸습니다.');
      return;
    }
    setIsAuthorVerified(true);
    setShowAuthorAuth(false);
  };

  const handleRemoveApplicant = async (applicationId: string) => {
    if (!window.confirm('이 참여자를 제외하시겠습니까?')) return;
    await supabase.from('team_applications').update({ status: 'rejected' }).eq('id', applicationId);
    if (post) {
      await supabase.from('team_posts').update({ current_members: Math.max(0, (post.current_members || 1) - 1) }).eq('id', post.id);
    }
    fetchPost();
  };

  const handleAccept = async (appId: string) => {
    await supabase.from('team_applications').update({ status: 'accepted' }).eq('id', appId);
    // increment current_members
    if (post) {
      await supabase.from('team_posts').update({ current_members: post.current_members + 1 }).eq('id', post.id);
    }
    fetchPost();
  };

  const handleReject = async (appId: string) => {
    await supabase.from('team_applications').update({ status: 'rejected' }).eq('id', appId);
    fetchPost();
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  if (loading) return (
    <div className="min-h-screen bg-aing-bg pt-32 flex items-center justify-center">
      <div className="text-aing-muted text-sm">Loading...</div>
    </div>
  );

  if (!post) return (
    <div className="min-h-screen bg-aing-bg pt-32 flex items-center justify-center">
      <div className="text-center">
        <p className="text-aing-muted mb-4">게시글을 찾을 수 없습니다.</p>
        <Link to="/team" className="btn-ghost text-sm">팀원 모집으로 돌아가기</Link>
      </div>
    </div>
  );

  const authorName = post.author_name || post.author?.name || '익명';
  const isFull = post.current_members >= post.max_members;

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <AnimatedSection>
          <Link to="/team" className="flex items-center gap-2 text-aing-muted hover:text-aing-text text-sm mb-8 transition-colors">
            <ArrowLeft size={14} />
            팀원 모집
          </Link>
        </AnimatedSection>

        <AnimatedSection delay={100}>
          <div className="card mb-6">
            {/* 상태 + 날짜 */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <span className={`text-xs px-3 py-1 rounded-full border font-medium ${
                post.status === 'open'
                  ? 'text-green-600 border-green-200 bg-green-50'
                  : 'text-aing-muted border-aing-border bg-gray-50'
              }`}>
                {post.status === 'open' ? '모집중' : '마감'}
              </span>
              <span className="text-xs text-aing-muted flex items-center gap-1">
                <Calendar size={12} />
                {formatDate(post.created_at)}
              </span>
            </div>

            {/* 제목 */}
            <h1 className="text-2xl font-semibold text-aing-text mb-3">{post.title}</h1>

            {/* 작성자 */}
            <div className="flex items-center gap-2 mb-6 pb-6 border-b border-aing-border">
              {post.author?.avatar_url ? (
                <img src={post.author.avatar_url} alt={authorName} className="w-7 h-7 rounded-full object-cover border border-aing-border" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-aing-blue/30 to-purple-400/30 border border-aing-border flex items-center justify-center">
                  <span className="text-xs font-semibold text-aing-text">{authorName[0]}</span>
                </div>
              )}
              {post.author?.id ? (
                <Link to={`/members/${post.author.id}`} className="text-sm text-aing-muted hover:text-aing-blue transition-colors">
                  {authorName}
                </Link>
              ) : (
                <span className="text-sm text-aing-muted">{authorName}</span>
              )}
            </div>

            {/* 설명 */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-aing-text mb-2">프로젝트 설명</h3>
              <p className="text-sm text-aing-muted leading-relaxed whitespace-pre-wrap">{post.description}</p>
            </div>

            {/* 모집 인원 */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-aing-text mb-2 flex items-center gap-1">
                <Users size={14} /> 모집 인원
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {Array.from({ length: post.max_members }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-6 h-6 rounded-full border-2 ${
                        i < post.current_members
                          ? 'bg-aing-blue border-aing-blue'
                          : 'bg-white border-aing-border'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-aing-muted">
                  {post.current_members} / {post.max_members}명
                  {isFull && <span className="text-red-500 ml-2">(마감)</span>}
                </span>
              </div>
            </div>

            {/* 필요 스킬 */}
            {post.required_skills && post.required_skills.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-aing-text mb-2">필요 스킬</h3>
                <div className="flex flex-wrap gap-2">
                  {post.required_skills.map(skill => (
                    <span key={skill} className="tag">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {/* 연락처 */}
            {post.contact && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-aing-text mb-2 flex items-center gap-1">
                  <MessageSquare size={14} /> 연락수단
                </h3>
                {post.contact.startsWith('http') ? (
                  <a href={post.contact} target="_blank" rel="noreferrer" className="text-sm text-aing-blue hover:opacity-80">
                    {post.contact}
                  </a>
                ) : (
                  <p className="text-sm text-aing-blue">{post.contact}</p>
                )}
              </div>
            )}

            {/* Accepted participants */}
            {acceptedApplications.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-aing-text mb-3">수락된 참여자</h3>
                <div className="flex flex-wrap gap-2">
                  {acceptedApplications.map(app => (
                    <div key={app.id} className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-1.5">
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-semibold">
                        {app.applicant_name[0]}
                      </div>
                      <span className="text-sm text-aing-text font-medium">{app.applicant_name}</span>
                      {canManage && (
                        <button
                          onClick={() => handleRemoveApplicant(app.id)}
                          className="ml-1 text-red-400 hover:text-red-600 transition-colors"
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

            {/* Pending applications — only for author/admin */}
            {canManage && pendingApplications.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-aing-text mb-3 flex items-center gap-2">
                  대기중 신청
                  <span className="bg-orange-100 text-orange-600 border border-orange-200 text-xs px-2 py-0.5 rounded-full font-medium">
                    새 신청 {pendingApplications.length}건
                  </span>
                </h3>
                <div className="space-y-2">
                  {pendingApplications.map(app => (
                    <div key={app.id} className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-xl">
                      <div className="w-7 h-7 rounded-full bg-orange-400 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                        {app.applicant_name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-aing-text">{app.applicant_name}</p>
                        {app.message && <p className="text-xs text-aing-muted mt-0.5">{app.message}</p>}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleAccept(app.id)}
                          className="text-green-600 hover:text-green-500 transition-colors"
                          title="수락"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button
                          onClick={() => handleReject(app.id)}
                          className="text-red-500 hover:text-red-400 transition-colors"
                          title="거절"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Author auth prompt (non-admin, non-author) */}
            {!canManage && (
              <div className="mb-4">
                {!showAuthorAuth ? (
                  <button
                    onClick={() => setShowAuthorAuth(true)}
                    className="text-xs text-aing-muted hover:text-aing-text transition-colors underline"
                  >
                    작성자로 신청 관리하기
                  </button>
                ) : (
                  <div className="p-3 bg-aing-bg border border-aing-border rounded-xl space-y-2">
                    <p className="text-xs text-aing-muted">작성자 비밀번호 입력</p>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={authorAuthPassword}
                        onChange={e => setAuthorAuthPassword(e.target.value)}
                        placeholder="비밀번호"
                        className="flex-1 border border-aing-border rounded-lg px-3 py-1.5 text-sm text-aing-text bg-aing-card outline-none focus:border-aing-blue"
                      />
                      <button
                        onClick={handleAuthorAuthVerify}
                        className="px-3 py-1.5 bg-aing-blue text-white text-xs rounded-lg hover:opacity-90"
                      >
                        확인
                      </button>
                      <button
                        onClick={() => setShowAuthorAuth(false)}
                        className="px-3 py-1.5 border border-aing-border text-aing-muted text-xs rounded-lg"
                      >
                        취소
                      </button>
                    </div>
                    {authorAuthError && <p className="text-red-500 text-xs">{authorAuthError}</p>}
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="pt-4 border-t border-aing-border flex items-center gap-3 flex-wrap">
              {!isAuthor && (
                <button
                  onClick={handleApply}
                  disabled={post.status === 'closed'}
                  className="flex items-center gap-1.5 bg-aing-blue text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Users size={14} />
                  참여 희망하기
                </button>
              )}
              {isAuthor && (
                <span className="text-xs text-aing-muted">내가 작성한 글입니다</span>
              )}

              {(isAdminUser || isAuthor) && (
                <button
                  onClick={openEditModal}
                  className="flex items-center gap-1.5 border border-aing-border text-aing-muted px-4 py-2 rounded-xl text-sm hover:text-aing-text hover:border-aing-blue transition-colors"
                >
                  <Pencil size={14} />
                  수정
                </button>
              )}

              {!showDelete ? (
                <button
                  onClick={() => setShowDelete(true)}
                  className="flex items-center gap-1 text-xs text-aing-muted hover:text-red-500 transition-colors ml-auto"
                >
                  <Trash2 size={12} /> 삭제
                </button>
              ) : (
                <div className="w-full space-y-2 mt-2">
                  {!isAdminUser && (
                    <>
                      <p className="text-xs text-aing-muted">작성자 비밀번호를 입력하세요.</p>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          value={deletePassword}
                          onChange={e => setDeletePassword(e.target.value)}
                          className="border border-aing-border rounded-lg px-3 py-1.5 text-sm text-aing-text bg-aing-bg outline-none focus:border-red-400 flex-1"
                          placeholder="비밀번호"
                        />
                        <button
                          onClick={handleDelete}
                          disabled={deleting}
                          className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 disabled:opacity-50"
                        >
                          {deleting ? '삭제 중...' : '삭제'}
                        </button>
                        <button
                          onClick={() => { setShowDelete(false); setDeleteError(''); }}
                          className="px-3 py-1.5 border border-aing-border text-aing-muted text-xs rounded-lg"
                        >
                          취소
                        </button>
                      </div>
                    </>
                  )}
                  {isAdminUser && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 disabled:opacity-50"
                      >
                        {deleting ? '삭제 중...' : '확인 삭제'}
                      </button>
                      <button
                        onClick={() => setShowDelete(false)}
                        className="px-3 py-1.5 border border-aing-border text-aing-muted text-xs rounded-lg"
                      >
                        취소
                      </button>
                    </div>
                  )}
                  {deleteError && <p className="text-red-500 text-xs">{deleteError}</p>}
                </div>
              )}
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={200}>
          <Link to="/team" className="btn-ghost text-sm inline-flex items-center gap-2">
            <ArrowLeft size={14} /> 목록으로
          </Link>
        </AnimatedSection>
      </div>

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

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-aing-card border border-aing-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-aing-text">게시글 수정</h2>
              <button onClick={() => setShowEditModal(false)} className="text-aing-muted hover:text-aing-text">
                <X size={18} />
              </button>
            </div>

            {!editAuthChecked ? (
              <div className="space-y-3">
                <p className="text-sm text-aing-muted">작성자 비밀번호를 확인해주세요.</p>
                <input
                  type="password"
                  value={editAuthPassword}
                  onChange={e => setEditAuthPassword(e.target.value)}
                  placeholder="비밀번호"
                  className="w-full border border-aing-border rounded-xl px-3 py-2 text-sm text-aing-text bg-aing-bg outline-none focus:border-aing-blue"
                />
                {editAuthError && <p className="text-red-500 text-xs">{editAuthError}</p>}
                <button
                  onClick={handleEditAuthCheck}
                  className="w-full bg-aing-blue text-white rounded-xl py-2.5 text-sm font-medium hover:opacity-90"
                >
                  확인
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-aing-muted mb-1 block">제목 *</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full border border-aing-border rounded-xl px-3 py-2 text-sm text-aing-text bg-aing-bg outline-none focus:border-aing-blue"
                  />
                </div>
                <div>
                  <label className="text-xs text-aing-muted mb-1 block">설명 *</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={4}
                    className="w-full border border-aing-border rounded-xl px-3 py-2 text-sm text-aing-text bg-aing-bg outline-none focus:border-aing-blue resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-aing-muted mb-1 block">필요 스킬 (쉼표 구분)</label>
                  <input
                    type="text"
                    value={editForm.required_skills}
                    onChange={(e) => setEditForm({ ...editForm, required_skills: e.target.value })}
                    className="w-full border border-aing-border rounded-xl px-3 py-2 text-sm text-aing-text bg-aing-bg outline-none focus:border-aing-blue"
                  />
                </div>
                <div>
                  <label className="text-xs text-aing-muted mb-1 block">모집 인원</label>
                  <input
                    type="number"
                    value={editForm.max_members}
                    onChange={(e) => setEditForm({ ...editForm, max_members: Number(e.target.value) })}
                    min={1}
                    max={20}
                    className="w-full border border-aing-border rounded-xl px-3 py-2 text-sm text-aing-text bg-aing-bg outline-none focus:border-aing-blue"
                  />
                </div>
                <div>
                  <label className="text-xs text-aing-muted mb-1 block">연락수단</label>
                  <input
                    type="text"
                    value={editForm.contact}
                    onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })}
                    className="w-full border border-aing-border rounded-xl px-3 py-2 text-sm text-aing-text bg-aing-bg outline-none focus:border-aing-blue"
                  />
                </div>
                <div>
                  <label className="text-xs text-aing-muted mb-1 block">상태</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'open' | 'closed' })}
                    className="w-full border border-aing-border rounded-xl px-3 py-2 text-sm text-aing-text bg-aing-bg outline-none focus:border-aing-blue"
                  >
                    <option value="open">모집중</option>
                    <option value="closed">마감</option>
                  </select>
                </div>
                {editError && <p className="text-red-500 text-xs">{editError}</p>}
                <button
                  onClick={handleEditSubmit}
                  disabled={editSubmitting}
                  className="w-full bg-aing-blue text-white rounded-xl py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {editSubmitting ? '수정 중...' : '수정하기'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPostDetailPage;
