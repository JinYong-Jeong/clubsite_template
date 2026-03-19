import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AnimatedSection from '../../components/AnimatedSection';

const AdminLoginPage: React.FC = () => {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const ok = await login(id, pw);
    if (ok) {
      navigate('/admin');
    } else {
      setError('ID 또는 비밀번호가 잘못되었습니다.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-aing-bg flex items-center justify-center px-6">
      <AnimatedSection>
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-aing-blue-light border border-blue-200 mb-4">
              <Lock size={20} className="text-aing-blue" />
            </div>
            <h1 className="text-xl font-semibold text-aing-text">Admin Login</h1>
            <p className="text-aing-muted text-sm mt-1">A.ing 관리자 패널</p>
          </div>

          <form onSubmit={handleSubmit} className="card space-y-4">
            <div>
              <label className="block text-xs text-aing-muted mb-2">Admin ID</label>
              <input
                type="text"
                value={id}
                onChange={e => setId(e.target.value)}
                className="input-field"
                placeholder="admin"
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-aing-muted mb-2">Password</label>
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
          </form>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default AdminLoginPage;
