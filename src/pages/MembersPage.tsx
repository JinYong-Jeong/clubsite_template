import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Github, Users, Pencil, ChevronDown, ChevronUp, X, Search } from 'lucide-react';
import { supabase, Member } from '../lib/supabase';
import AnimatedSection from '../components/AnimatedSection';
import { useSiteSettings } from '../context/SiteSettingsContext';

const TRACK_LABELS: Record<string, string> = {
  junior: 'Junior',
  senior: 'Senior',
  admin: 'Admin',
  ob: 'OB',
};

const TRACK_COLORS: Record<string, string> = {
  junior: 'text-aing-blue border-blue-200 bg-aing-blue-light',
  senior: 'text-purple-500 border-purple-200 bg-purple-50',
  admin: 'text-green-500 border-green-200 bg-green-50',
  ob: 'text-gray-500 border-gray-200 bg-gray-50',
};

const STATUS_COLORS: Record<string, string> = {
  busy: 'bg-red-100 text-red-700 border-red-200',
  mid: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  free: 'bg-green-100 text-green-700 border-green-200',
};

const STATUS_LABELS: Record<string, string> = {
  busy: '바쁨',
  mid: '프로젝트 관심',
  free: '프로젝트 희망',
};

const demoMembers: Member[] = [];

const WorkloadDots: React.FC<{ value: number }> = ({ value }) => {
  const filled = value ?? 0;
  return (
    <span className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={`text-xs ${i < filled ? 'text-aing-blue' : 'text-aing-border'}`}>
          {i < filled ? '●' : '○'}
        </span>
      ))}
    </span>
  );
};

const MembersPage: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const siteSettings = useSiteSettings();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(12);
  const [page, setPage] = useState(1);

  // Filters
  const [trackFilter, setTrackFilter] = useState<'all' | 'junior' | 'senior' | 'admin' | 'ob'>('all');
  const [interestFilter, setInterestFilter] = useState<string>('');
  const [workloadFilter, setWorkloadFilter] = useState<'' | 'light' | 'normal' | 'heavy'>('');
  const [statusFilter, setStatusFilter] = useState<'' | 'busy' | 'mid' | 'free'>('');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: true });
        if (error || !data || data.length === 0) {
          setMembers(demoMembers);
        } else {
          setMembers(data);
        }
      } catch {
        setMembers(demoMembers);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  // Extract interests from site_settings (admin 관리) + 멤버 데이터 병합
  const allInterests = siteSettings.interests_list
    ? siteSettings.interests_list.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  const filtered = members.filter(m => {
    if (trackFilter !== 'all' && m.track !== trackFilter) return false;
    if (interestFilter && !(m.interests ?? []).includes(interestFilter)) return false;
    if (workloadFilter) {
      const w = m.workload ?? 0;
      if (workloadFilter === 'light' && w > 2) return false;
      if (workloadFilter === 'normal' && w !== 3) return false;
      if (workloadFilter === 'heavy' && w < 4) return false;
    }
    if (statusFilter && m.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        m.name.toLowerCase().includes(q) ||
        (m.bio || '').toLowerCase().includes(q) ||
        (m.role || '').toLowerCase().includes(q) ||
        (m.interests || []).some((i: string) => i.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const hasFilters = trackFilter !== 'all' || interestFilter !== '' || workloadFilter !== '' || statusFilter !== '';

  const resetFilters = () => {
    setTrackFilter('all');
    setInterestFilter('');
    setWorkloadFilter('');
    setStatusFilter('');
  };

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      {/* Header */}
      <section className="py-20 px-6 border-b border-aing-border">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 tag-blue mb-6">
              <Users size={12} />
              <span>Members</span>
            </div>
            <h1 className="section-title text-5xl mb-4">
              <span className="text-gradient">Our People</span>
            </h1>
            <p className="section-subtitle">AI를 함께 탐구하는 A.ing의 멤버들</p>
          </AnimatedSection>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 px-6 border-b border-aing-border bg-aing-bg">
        <div className="max-w-6xl mx-auto">
          {/* Filter toggle header */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 text-sm font-medium text-aing-text hover:text-aing-blue transition-colors"
            >
              {filtersOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              필터
              {hasFilters && (
                <span className="text-xs bg-aing-blue text-white rounded-full px-2 py-0.5">적용중</span>
              )}
            </button>
            <select value={pageSize} onChange={e=>{setPageSize(Number(e.target.value));setPage(1);}} className="input-field py-1 text-xs w-20">
              <option value={12}>12개</option>
              <option value={24}>24개</option>
              <option value={48}>48개</option>
            </select>
            <div className="flex items-center gap-3">
              {hasFilters && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-xs text-aing-muted hover:text-red-500 transition-colors"
                >
                  <X size={12} />
                  초기화
                </button>
              )}
              <span className="text-aing-muted text-sm">
                {filtered.length} / {members.length} members
              </span>
            </div>
          </div>

          {filtersOpen && (
            <div className="space-y-3">
              <div className="relative mb-3">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-aing-muted" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="이름, 역할, 관심사 검색..." className="input-field pl-9 text-sm w-full" />
              </div>
              {/* Track filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-aing-muted w-14 shrink-0">트랙</span>
                {(['all', 'admin', 'senior', 'junior', 'ob'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setTrackFilter(f)}
                    className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                      trackFilter === f
                        ? 'bg-aing-dark text-white'
                        : 'border border-aing-border text-aing-muted hover:border-aing-blue hover:text-aing-blue'
                    }`}
                  >
                    {f === 'all' ? 'All' : TRACK_LABELS[f]}
                  </button>
                ))}
              </div>

              {/* Interest filter */}
              {allInterests.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-aing-muted w-14 shrink-0">관심분야</span>
                  <button
                    onClick={() => setInterestFilter('')}
                    className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                      interestFilter === ''
                        ? 'bg-aing-blue text-white'
                        : 'border border-aing-border text-aing-muted hover:border-aing-blue hover:text-aing-blue'
                    }`}
                  >
                    All
                  </button>
                  {allInterests.map(interest => (
                    <button
                      key={interest}
                      onClick={() => setInterestFilter(interestFilter === interest ? '' : interest)}
                      className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                        interestFilter === interest
                          ? 'bg-aing-blue text-white'
                          : 'border border-aing-border text-aing-muted hover:border-aing-blue hover:text-aing-blue'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              )}

              {/* Workload filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-aing-muted w-14 shrink-0">포화도</span>
                {([
                  { value: '', label: 'All' },
                  { value: 'light', label: '여유있음 (0-2)' },
                  { value: 'normal', label: '보통 (3)' },
                  { value: 'heavy', label: '바쁨 (4-5)' },
                ] as { value: '' | 'light' | 'normal' | 'heavy'; label: string }[]).map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setWorkloadFilter(opt.value)}
                    className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                      workloadFilter === opt.value
                        ? 'bg-aing-dark text-white'
                        : 'border border-aing-border text-aing-muted hover:border-aing-blue hover:text-aing-blue'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-aing-muted w-14 shrink-0">상태</span>
                {([
                  { value: '', label: 'All' },
                  { value: 'busy', label: '바쁨' },
                  { value: 'mid', label: '프로젝트 관심' },
                  { value: 'free', label: '프로젝트 희망' },
                ] as { value: '' | 'busy' | 'mid' | 'free'; label: string }[]).map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setStatusFilter(opt.value)}
                    className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                      statusFilter === opt.value
                        ? 'bg-aing-dark text-white'
                        : 'border border-aing-border text-aing-muted hover:border-aing-blue hover:text-aing-blue'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="w-16 h-16 rounded-2xl bg-aing-border mb-4" />
                  <div className="h-4 bg-aing-border rounded w-2/3 mb-2" />
                  <div className="h-3 bg-aing-border rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-aing-muted text-sm mb-3">조건에 맞는 멤버가 없습니다.</p>
              <button onClick={resetFilters} className="btn-ghost text-sm">필터 초기화</button>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
              {paginated.map((member, i) => {
                const status = member.status ?? 'free';
                const workload = member.workload ?? 0;
                const interests = member.interests ?? [];
                return (
                  <AnimatedSection key={member.id} delay={i * 50}>
                    <div className="card group hover:border-blue-200 flex flex-col relative">
                      {/* Looking for team badge */}
                      {member.looking_for_team && (
                        <div className="absolute top-3 right-3">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 font-medium">
                            팀원 구함
                          </span>
                        </div>
                      )}

                      <Link to={`/members/${member.id}`} className="flex-1 block">
                        {/* Avatar */}
                        <div className="mb-4">
                          {member.avatar_url ? (
                            <img
                              src={member.avatar_url}
                              alt={member.name}
                              className="w-16 h-16 rounded-2xl object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 border border-aing-border flex items-center justify-center">
                              <span className="text-aing-text font-semibold text-lg">
                                {getInitials(member.name)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-aing-text text-sm">{member.name}</h3>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full border font-medium ${STATUS_COLORS[status]}`}>
                              {STATUS_LABELS[status]}
                            </span>
                          </div>
                          <p className="text-aing-muted text-xs mt-0.5">{member.role}</p>
                        </div>

                        {/* Track + Semester tags */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-mono ${TRACK_COLORS[member.track]}`}>
                            {TRACK_LABELS[member.track]}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full border border-aing-border text-aing-muted font-mono">
                            {member.semester}
                          </span>
                        </div>

                        {/* Interests tags (max 3) */}
                        {interests.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {interests.slice(0, 3).map(tag => (
                              <span key={tag} className="text-xs px-1.5 py-0.5 rounded-full bg-blue-50 text-aing-blue border border-blue-100">
                                {tag}
                              </span>
                            ))}
                            {interests.length > 3 && (
                              <span className="text-xs text-aing-muted">+{interests.length - 3}</span>
                            )}
                          </div>
                        )}

                        {/* Bio */}
                        {member.bio && (
                          <p className="text-aing-muted text-xs leading-relaxed mb-3 line-clamp-2">
                            {member.bio}
                          </p>
                        )}

                        {/* Workload dots */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-aing-muted">워크로드</span>
                          <WorkloadDots value={workload} />
                        </div>

                        {/* GitHub link */}
                        {member.github && (
                          <span className="flex items-center gap-1 text-xs text-aing-muted">
                            <Github size={12} />
                            GitHub
                          </span>
                        )}
                      </Link>

                      {/* Profile Edit Link */}
                      <div className="mt-3 pt-3 border-t border-aing-border flex justify-end">
                        <Link
                          to={`/members/${member.id}/edit`}
                          className="flex items-center gap-1 text-xs text-aing-muted hover:text-aing-blue transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Pencil size={10} />
                          프로필 수정
                        </Link>
                      </div>
                    </div>
                  </AnimatedSection>
                );
              })}
            </div>
          )}
        </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-8">
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-40">← 이전</button>
              {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
                <button key={p} onClick={()=>setPage(p)} className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${page===p?'bg-aing-dark text-white':'border-aing-border text-aing-muted hover:border-aing-blue'}`}>{p}</button>
              ))}
              <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-40">다음 →</button>
            </div>
          )}
      </section>
    </div>
  );
};

export default MembersPage;
