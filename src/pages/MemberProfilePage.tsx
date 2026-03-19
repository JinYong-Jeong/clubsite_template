import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Eye, EyeOff } from 'lucide-react';
import { supabase, Member } from '../lib/supabase';

const WORKLOAD_LABELS = ['여유', '여유', '보통', '바쁨', '바쁨', '매우 바쁨'];
const WORKLOAD_COLORS = ['text-green-600', 'text-green-600', 'text-yellow-600', 'text-orange-500', 'text-orange-600', 'text-red-600'];

const STATUS_OPTIONS = [
  { value: 'busy', label: '바쁨', color: 'bg-red-100 text-red-700 border-red-300' },
  { value: 'mid', label: '프로젝트 관심', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'free', label: '프로젝트 희망', color: 'bg-green-100 text-green-700 border-green-300' },
];

type FormData = {
  bio: string;
  avatar_url: string;
  interests: string;
  skills: string;
  workload: number;
  status: 'busy' | 'mid' | 'free';
  looking_for_team: boolean;
  project_idea: string;
  contact_info: string;
  contact_email: string;
  github: string;
  linkedin: string;
  new_password: string;
};

const MemberProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [isSettingPassword, setIsSettingPassword] = useState(false);

  const [form, setForm] = useState<FormData>({
    bio: '',
    avatar_url: '',
    interests: '',
    skills: '',
    workload: 0,
    status: 'free',
    looking_for_team: false,
    project_idea: '',
    contact_info: '',
    contact_email: '',
    github: '',
    linkedin: '',
    new_password: '',
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchMember = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .eq('id', id)
          .single();
        if (error || !data) {
          setNotFound(true);
        } else {
          setMember(data);
          setIsSettingPassword(!data.password_hash);
          setForm({
            bio: data.bio ?? '',
            avatar_url: data.avatar_url ?? '',
            interests: (data.interests ?? []).join(', '),
            skills: (data.skills ?? []).join(', '),
            workload: data.workload ?? 0,
            status: (data.status as 'busy' | 'mid' | 'free') ?? 'free',
            looking_for_team: data.looking_for_team ?? false,
            project_idea: data.project_idea ?? '',
            contact_info: data.contact_info ?? '',
            contact_email: data.contact_email ?? '',
            github: data.github ?? '',
            linkedin: data.linkedin ?? '',
            new_password: '',
          });
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchMember();
  }, [id]);

  const handlePasswordSubmit = () => {
    if (!member) return;
    if (!password.trim()) {
      setPasswordError('비밀번호를 입력해주세요.');
      return;
    }
    if (isSettingPassword) {
      setAuthenticated(true);
      setPasswordError('');
    } else {
      if (password === member.password_hash) {
        setAuthenticated(true);
        setPasswordError('');
      } else {
        setPasswordError('비밀번호가 일치하지 않습니다.');
      }
    }
  };

  const handleSave = async () => {
    if (!member || !id) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        bio: form.bio,
        avatar_url: form.avatar_url,
        github: form.github,
        linkedin: form.linkedin,
        interests: typeof form.interests === 'string'
          ? form.interests.split(',').map((s: string) => s.trim()).filter(Boolean)
          : form.interests,
        skills: typeof form.skills === 'string'
          ? form.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
          : form.skills,
        workload: Number(form.workload),
        status: form.status,
        looking_for_team: form.looking_for_team,
        project_idea: form.project_idea,
        contact_info: form.contact_info,
      };

      if (isSettingPassword && password.trim()) {
        payload.password_hash = password.trim();
      } else if (form.new_password && form.new_password.trim()) {
        payload.password_hash = form.new_password.trim();
      }

      const { error } = await supabase
        .from('members')
        .update(payload)
        .eq('id', id);

      if (error) throw error;
      navigate(`/members/${id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Profile save error:', msg);
      alert('저장 실패: ' + msg);
    }
    setSaving(false);
  };

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  if (loading) {
    return (
      <div className="min-h-screen bg-aing-bg pt-20 flex items-center justify-center">
        <div className="text-aing-muted text-sm">불러오는 중...</div>
      </div>
    );
  }

  if (notFound || !member) {
    return (
      <div className="min-h-screen bg-aing-bg pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold text-gradient mb-4">404</div>
          <p className="text-aing-muted mb-6">멤버를 찾을 수 없습니다.</p>
          <Link to="/members" className="btn-primary text-sm">멤버 목록으로</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      <div className="max-w-xl mx-auto px-6 py-12">
        <Link
          to={`/members/${member.id}`}
          className="inline-flex items-center gap-1 text-aing-muted hover:text-aing-text text-sm mb-8 transition-colors"
        >
          <ChevronLeft size={14} />
          프로필 보기
        </Link>

        {/* Member Header */}
        <div className="flex items-center gap-4 mb-8">
          {member.avatar_url ? (
            <img
              src={member.avatar_url}
              alt={member.name}
              className="w-16 h-16 rounded-2xl object-cover border border-aing-border"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 border border-aing-border flex items-center justify-center shrink-0">
              <span className="text-aing-text font-semibold text-xl">
                {getInitials(member.name)}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-lg font-bold text-aing-text">{member.name}</h1>
            <p className="text-aing-muted text-sm">{member.role}</p>
          </div>
        </div>

        {/* Password Section */}
        {!authenticated ? (
          <div className="bg-aing-card border border-aing-border rounded-2xl p-6">
            <h2 className="font-semibold text-aing-text mb-1">
              {isSettingPassword ? '초기 비밀번호 설정' : '본인 확인'}
            </h2>
            <p className="text-aing-muted text-xs mb-4">
              {isSettingPassword
                ? '처음 접속입니다. 사용할 비밀번호를 설정해주세요.'
                : '프로필을 수정하려면 비밀번호를 입력해주세요.'}
            </p>
            <div className="relative mb-3">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                placeholder="비밀번호"
                autoComplete="current-password"
                className="w-full border border-aing-border rounded-xl px-4 py-2.5 text-sm text-aing-text bg-aing-bg outline-none focus:border-aing-blue pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-aing-muted hover:text-aing-text"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {passwordError && (
              <p className="text-red-500 text-xs mb-3">{passwordError}</p>
            )}
            <button
              onClick={handlePasswordSubmit}
              className="w-full bg-aing-blue text-white rounded-xl py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {isSettingPassword ? '비밀번호 설정 후 수정하기' : '확인'}
            </button>
          </div>
        ) : (
          <div className="space-y-5 animate-[fadeIn_0.3s_ease]">
            {/* Avatar URL */}
            <div className="bg-aing-card border border-aing-border rounded-2xl p-5">
              <h3 className="text-xs font-semibold text-aing-muted uppercase tracking-wider mb-3">기본 정보</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-aing-muted mb-1 block">프로필 이미지 URL</label>
                  <input
                    type="text"
                    value={form.avatar_url}
                    onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full border border-aing-border rounded-xl px-3 py-2 text-sm text-aing-text bg-aing-bg outline-none focus:border-aing-blue"
                  />
                </div>
                <div>
                  <label className="text-xs text-aing-muted mb-1 block">한 줄 소개 (bio)</label>
                  <input
                    type="text"
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    placeholder="자신을 소개해 주세요"
                    className="w-full border border-aing-border rounded-xl px-3 py-2 text-sm text-aing-text bg-aing-bg outline-none focus:border-aing-blue"
                  />
                </div>
                <div>
                  <label className="text-xs text-aing-muted mb-1 block">GitHub URL</label>
                  <input
                    type="text"
                    value={form.github}
                    onChange={(e) => setForm({ ...form, github: e.target.value })}
                    placeholder="https://github.com/username"
                    className="w-full border border-aing-border rounded-xl px-3 py-2 text-sm text-aing-text bg-aing-bg outline-none focus:border-aing-blue"
                  />
                </div>
                <div>
                  <label className="text-xs text-aing-muted mb-1 block">LinkedIn URL</label>
                  <input
                    type="text"
                    value={form.linkedin}
                    onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full border border-aing-border rounded-xl px-3 py-2 text-sm text-aing-text bg-aing-bg outline-none focus:border-aing-blue"
                  />
                </div>
              </div>
            </div>

            {/* Interests & Skills */}
            <div className="bg-aing-card border border-aing-border rounded-2xl p-5">
              <h3 className="text-xs font-semibold text-aing-muted uppercase tracking-wider mb-3">관심사 & 기술</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-aing-muted mb-1 block">관심 분야 (쉼표로 구분)</label>
                  <input
                    type="text"
                    value={form.interests}
                    onChange={(e) => setForm({ ...form, interests: e.target.value })}
                    placeholder="CV, NLP, RL"
                    className="w-full border border-aing-border rounded-xl px-3 py-2 text-sm text-aing-text bg-aing-bg outline-none focus:border-aing-blue"
                  />
                </div>
                <div>
                  <label className="text-xs text-aing-muted mb-1 block">보유 기술 (쉼표로 구분)</label>
                  <input
                    type="text"
                    value={form.skills}
                    onChange={(e) => setForm({ ...form, skills: e.target.value })}
                    placeholder="Python, PyTorch, React"
                    className="w-full border border-aing-border rounded-xl px-3 py-2 text-sm text-aing-text bg-aing-bg outline-none focus:border-aing-blue"
                  />
                </div>
              </div>
            </div>

            {/* Workload */}
            <div className="bg-aing-card border border-aing-border rounded-2xl p-5">
              <h3 className="text-xs font-semibold text-aing-muted uppercase tracking-wider mb-3">업무 포화도</h3>
              <div className="flex items-center gap-3 mb-2">
                <input
                  type="range"
                  min={0}
                  max={5}
                  value={form.workload}
                  onChange={(e) => setForm({ ...form, workload: Number(e.target.value) })}
                  className="flex-1 accent-aing-blue"
                />
                <span className={`text-sm font-semibold w-20 text-right ${WORKLOAD_COLORS[form.workload]}`}>
                  {form.workload} — {WORKLOAD_LABELS[form.workload]}
                </span>
              </div>
              <div className="flex justify-between text-xs text-aing-muted">
                <span>0 여유</span>
                <span>5 매우 바쁨</span>
              </div>
            </div>

            {/* Status */}
            <div className="bg-aing-card border border-aing-border rounded-2xl p-5">
              <h3 className="text-xs font-semibold text-aing-muted uppercase tracking-wider mb-3">상태</h3>
              <div className="flex gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setForm({ ...form, status: opt.value as 'busy' | 'mid' | 'free' })}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${
                      form.status === opt.value
                        ? opt.color + ' border-opacity-100'
                        : 'border-aing-border text-aing-muted hover:border-aing-blue hover:text-aing-blue'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Team */}
            <div className="bg-aing-card border border-aing-border rounded-2xl p-5">
              <h3 className="text-xs font-semibold text-aing-muted uppercase tracking-wider mb-3">팀원 모집</h3>
              <label className="flex items-center gap-3 cursor-pointer mb-3">
                <div
                  onClick={() => setForm({ ...form, looking_for_team: !form.looking_for_team })}
                  className={`w-10 h-5 rounded-full transition-all relative ${
                    form.looking_for_team ? 'bg-aing-blue' : 'bg-aing-border'
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${
                      form.looking_for_team ? 'left-5' : 'left-0.5'
                    }`}
                  />
                </div>
                <span className="text-sm text-aing-text">팀원 구하는 중</span>
              </label>
              {form.looking_for_team && (
                <div>
                  <label className="text-xs text-aing-muted mb-1 block">프로젝트 아이디어</label>
                  <textarea
                    value={form.project_idea}
                    onChange={(e) => setForm({ ...form, project_idea: e.target.value })}
                    placeholder="어떤 프로젝트를 하고 싶으신가요?"
                    rows={3}
                    className="w-full border border-aing-border rounded-xl px-3 py-2 text-sm text-aing-text bg-aing-bg outline-none focus:border-aing-blue resize-none"
                  />
                </div>
              )}
            </div>

            {/* Contact */}
            <div className="bg-aing-card border border-aing-border rounded-2xl p-5">
              <h3 className="text-xs font-semibold text-aing-muted uppercase tracking-wider mb-3">연락처</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-aing-muted mb-1 block">연락수단</label>
                  <input
                    type="text"
                    value={form.contact_info}
                    onChange={(e) => setForm({ ...form, contact_info: e.target.value })}
                    placeholder="연락수단 링크 또는 ID"
                    className="w-full border border-aing-border rounded-xl px-3 py-2 text-sm text-aing-text bg-aing-bg outline-none focus:border-aing-blue"
                  />
                </div>
                <div>
                  <label className="text-xs text-aing-muted mb-1 block">연락용 이메일</label>
                  <input
                    type="email"
                    value={form.contact_email}
                    onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                    placeholder="example@email.com"
                    className="w-full border border-aing-border rounded-xl px-3 py-2 text-sm text-aing-text bg-aing-bg outline-none focus:border-aing-blue"
                  />
                </div>
              </div>
            </div>

            {/* Password Change */}
            <div className="bg-aing-card border border-aing-border rounded-2xl p-5">
              <h3 className="text-xs font-semibold text-aing-muted uppercase tracking-wider mb-3">비밀번호 변경 (선택)</h3>
              <input
                type="password"
                value={form.new_password}
                onChange={(e) => setForm({ ...form, new_password: e.target.value })}
                placeholder="새 비밀번호 (비우면 변경 안 함)"
                autoComplete="new-password"
                className="w-full border border-aing-border rounded-xl px-3 py-2 text-sm text-aing-text bg-aing-bg outline-none focus:border-aing-blue"
              />
            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-aing-blue text-white rounded-xl py-3 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save size={14} />
              {saving ? '저장 중...' : '저장하기'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberProfilePage;
