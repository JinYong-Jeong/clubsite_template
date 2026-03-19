import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AnimatedSection from '../components/AnimatedSection';

const LoginPage: React.FC = () => {
  const [name, setName] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: string })?.from || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const ok = await login(name, pw);
    if (ok) {
      // 어드민이면 /admin으로 이동
      if (name.trim() === 'admin') {
        navigate('/admin');
      } else {
        navigate(from);
      }
    } else {
      setError('이름 또는 비밀번호가 잘못되었습니다.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-aing-bg flex items-center justify-center px-6">
      <AnimatedSection>
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-aing-blue-light border border-blue-200 mb-4">
              <LogIn size={20} className="text-aing-blue" />
            </div>
            <h1 className="text-xl font-semibold text-aing-text">로그인</h1>
            <p className="text-aing-muted text-sm mt-1">YourClub 멤버 로그인</p>
          </div>

          <form onSubmit={handleSubmit} className="card space-y-4">
            <div>
              <label className="block text-xs text-aing-muted mb-2">이름 (ID)</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="input-field"
                placeholder="등록된 이름"
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-aing-muted mb-2">비밀번호</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={pw}
                  onChange={e => setPw(e.target.value)}
                  className="input-field pr-10"
                  placeholder="••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-aing-muted hover:text-aing-text transition-colors"
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? '로그인 중...' : '로그인'}
            </button>
            <p className="text-xs text-aing-muted text-center pt-1">
              YourClub 멤버로 등록된 이름과 비밀번호를 사용하세요.
            </p>
            <p className="text-xs text-aing-muted text-center">
              비밀번호를 잊으셨나요?{' '}
              <Link to="/members" className="text-aing-blue hover:underline">
                프로필 페이지에서 설정
              </Link>
            </p>
          </form>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default LoginPage;
